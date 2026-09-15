import part0 from "./hero-video-chunks/part0";
import part1 from "./hero-video-chunks/part1";
import part2 from "./hero-video-chunks/part2";
import part3 from "./hero-video-chunks/part3";
import part4 from "./hero-video-chunks/part4";
import part5 from "./hero-video-chunks/part5";
import part6 from "./hero-video-chunks/part6";
import part7 from "./hero-video-chunks/part7";

export const HERO_VIDEO_SRC =
  "data:video/mp4;base64," +
  [part0, part1, part2, part3, part4, part5, part6, part7].join("");
