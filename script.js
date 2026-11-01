'use strict';

// Fill in only confirmed publication metadata. Empty fields preserve the author area.
const publication = { authors: '', affiliations: '' };
document.querySelector('#authors').textContent = publication.authors;
document.querySelector('#affiliations').textContent = publication.affiliations;

function setupTabs(selector, onSelect) {
  const buttons = [...document.querySelectorAll(selector)];
  function select(button) {
    buttons.forEach(item => {
      item.setAttribute('aria-selected', String(item === button));
      item.tabIndex = item === button ? 0 : -1;
    });
    onSelect(button);
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        buttons[next].focus();
        select(buttons[next]);
      }
    });
  });
}

setupTabs('[data-asset]', button => {
  const key = button.dataset.asset;
  for (const stage of ['input', 'urdf', 'contact']) {
    const image = document.querySelector('#asset-' + stage);
    image.src = 'assets/images/' + key + '-' + stage + '.webp';
    image.alt = button.textContent + ' — ' + {input: 'source image', urdf: 'articulated geometry', contact: 'contact annotation'}[stage];
  }
  document.querySelector('#asset-panel').setAttribute('aria-labelledby', button.id);
});

const tasks = {
  microwave: { instruction: 'Close the microwave door.', real: true },
  display: { instruction: 'Adjust the display.', real: true },
  drawer: { instruction: 'Close the top drawer.', real: true },
  faucet: { instruction: 'Adjust the faucet.', real: true, hard: true },
  laptop: { instruction: 'Close the laptop lid.', real: false },
  lamp: { instruction: 'Lower the desk lamp.', real: false, hard: true }
};
const sim = document.querySelector('#sim-video');
const real = document.querySelector('#real-video');
const snapshot = document.querySelector('#real-snapshot');
const play = document.querySelector('#play-pair');
const note = document.querySelector('#demo-note');
let selectedTask = 'microwave';
let selectionVersion = 0;
function visibleVideos() { return tasks[selectedTask].real ? [sim, real] : [sim]; }
function updatePlayLabel() {
  const running = visibleVideos().some(video => !video.paused);
  play.textContent = (running ? 'Ⅱ Pause' : '▶ Play') + (tasks[selectedTask].real ? ' both' : ' simulation');
}
setupTabs('[data-task]', button => {
  selectionVersion++;
  selectedTask = button.dataset.task;
  const task = tasks[selectedTask];
  sim.pause(); real.pause();
  sim.src = 'assets/videos/sim-' + selectedTask + '.mp4';
  sim.poster = 'assets/images/sim-' + selectedTask + '-poster.jpg';
  sim.setAttribute('aria-label', button.textContent + ' simulation demonstration');
  sim.load();
  real.hidden = !task.real;
  snapshot.hidden = task.real;
  if (task.real) {
    real.src = 'assets/videos/real-' + selectedTask + '.mp4';
    real.poster = 'assets/images/real-' + selectedTask + '-poster.jpg';
    real.setAttribute('aria-label', button.textContent + ' real-world demonstration');
    real.load();
  } else {
    real.removeAttribute('src'); real.load();
    snapshot.src = 'assets/images/real-' + selectedTask + '.webp';
    snapshot.alt = button.textContent + ' real-world rollout snapshot from the FITR manuscript';
  }
  document.querySelector('#task-instruction').textContent = '“' + task.instruction + '”';
  document.querySelector('#task-type').textContent = task.hard ? 'CHALLENGING TASK' : 'STANDARD TASK';
  document.querySelector('#real-media-type').textContent = task.real ? 'Robot rollout' : 'Paper snapshot';
  note.textContent = task.real ? 'Independent recordings; playback starts together.' : 'Real-world panel: a static rollout snapshot from the paper.';
  document.querySelector('#demo-panel').setAttribute('aria-labelledby', button.id);
  updatePlayLabel();
});
play.addEventListener('click', async () => {
  const version = selectionVersion;
  const videos = visibleVideos();
  if (videos.some(video => !video.paused)) videos.forEach(video => video.pause());
  else {
    const results = await Promise.allSettled(videos.map(video => video.play()));
    if (version === selectionVersion && results.some(result => result.status === 'rejected')) note.textContent = 'Use the play control on each video to start playback.';
  }
  updatePlayLabel();
});
document.querySelector('#restart-pair').addEventListener('click', () => {
  visibleVideos().forEach(video => { if (video.readyState > 0) video.currentTime = 0; });
});
for (const video of [sim, real]) {
  video.addEventListener('play', updatePlayLabel);
  video.addEventListener('pause', updatePlayLabel);
  video.addEventListener('error', () => {
    if (video.getAttribute('src')) note.textContent = 'This video could not load. Please reload or open the media file directly.';
  });
}

const sections = [...document.querySelectorAll('main > section[id]')];
const links = [...document.querySelectorAll('.contents nav a')];
function updateContents() {
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= 180) current = section;
  links.forEach(link => {
    const active = link.getAttribute('href') === '#' + current.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let scheduled = false;
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(() => { updateContents(); scheduled = false; }); }
}, {passive: true});
updateContents();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause());
});
