/* Disable errors for functions included from other files via manifest.json. */
/* eslint-disable no-undef */

/** Hides meme posts and replies to meme posts. */
const hideMemePosts = (thread) => {
  createFilter().then((filter) => {
    const op = thread.posts[0];
    const opIsMemePost = [op].filter(filter).length > 0;
    if (opIsMemePost) {
      hideThread(op);
    } else {
      const memeReplies = getMemePosts(thread.posts, filter);
      memeReplies.forEach(hidePost);
    }
  });
};

/** Gets the threadnumber from a thread within the DOM. */
const getThreadNumber = thread => thread.id.match(/t(\d+)/)[1];

/** Gets the thread path for a thread within the DOM of the board. */
const getPath = (thread) => {
  const board = document.location.pathname.match(/\/(\w+)\/d*/)[1];
  return `${board}/thread/${getThreadNumber(thread)}/`;
};

const observer = new MutationObserver((records) => {
  records.forEach((record) => {
    const threadFilter = node => node.classList.contains('thread');
    const threads = Array.from(record.addedNodes).filter(threadFilter);
    threads.forEach((threadFragment) => {
      fetchThread(getPath(threadFragment)).then((thread) => {
        saveThread(thread);
        hideMemePosts(thread);
      });
    });
  });
});
observer.observe(document.querySelector('.board'), { childList: true });

chrome.runtime.onMessage.addListener(({ cmd }) => {
  if (cmd === 'reapplyFilters') {
    const hiddenPosts = Array.from(document.querySelectorAll('.post-hidden'));
    const hiddenPostNos = hiddenPosts.map(post => post.id.match(/\d+/)[0]);
    hiddenPostNos.forEach(showPost);
    hiddenPostNos.forEach(showThread);
    document.querySelectorAll('.thread').forEach((thread) => {
      hideMemePosts(loadThread(getThreadNumber(thread)));
    });
  }
});

document.querySelectorAll('.thread').forEach((threadFragment) => {
  fetchThread(getPath(threadFragment)).then((thread) => {
    saveThread(thread);
    hideMemePosts(thread);
  });
});
