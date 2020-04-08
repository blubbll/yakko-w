"use strict";
console.clear();

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//set generic
let { app_start, route } = window;

class VideoController {
  constructor() {
    this.cacheSelectors();
    this.bindEvents();
  }

  cacheSelectors() {
    this.selectors = {};
    this.selectors.bodyElement = document.querySelector("body");
    this.selectors.videoWrapElement = document.querySelector(".js-video-wrap");
    this.selectors.videoElement = this.selectors.videoWrapElement.querySelector(
      ".js-video"
    );
    this.selectors.playButtonElement = document.querySelector(".js-play-video");
    this.selectors.closeButtonElement = document.querySelector(
      ".js-close-video"
    );
  }

  bindEvents() {
    this.selectors.playButtonElement.addEventListener(
      "click",
      this.onPlayClick.bind(this)
    );
    this.selectors.closeButtonElement.addEventListener(
      "click",
      this.onCloseClick.bind(this)
    );
    this.selectors.videoElement.addEventListener(
      "ended",
      this.onVideoEnded.bind(this)
    );

    if (this.selectors.videoElement.readyState === 4) {
      this.onVideoCanPlayThrough();
    } else {
      this.selectors.videoElement.addEventListener(
        "canplaythrough",
        this.onVideoCanPlayThrough.bind(this)
      );
    }
  }

  onPlayClick(event) {
    event.preventDefault();
    this.showVideo();
  }

  onCloseClick(event) {
    event.preventDefault();
    this.hideVideo();
  }

  onVideoCanPlayThrough() {
    this.selectors.bodyElement.classList.add("video-loaded");
  }

  onVideoEnded() {
    this.hideVideo();
  }

  updateData(country, count) {
    $("current").innerHTML = `
      <data>
        <p id="country">
          ${country}
        </p>
        <p id="count">
          ${count}
        </p>
      </data>`;
  }

  showVideo() {
    this.selectors.videoElement.currentTime = 0;
    this.selectors.videoWrapElement.classList.remove("video-wrap--hide");
    this.selectors.videoWrapElement.classList.add("video-wrap--show");
    setTimeout(() => this.selectors.videoElement.play(), 600);
  }

  hideVideo() {
    this.selectors.videoWrapElement.classList.remove("video-wrap--show");
    this.selectors.videoWrapElement.classList.add("video-wrap--hide");
    this.selectors.videoElement.pause();
  }
}

const V = new VideoController();

V.updateData("Germany", 9000);
