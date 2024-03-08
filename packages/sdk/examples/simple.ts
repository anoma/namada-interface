import initSync from "../src/initSync";

function main() {
  const url = "127.0.0.1:27658";
  const token = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e"; // Required

  try {
    const sdk = initSync(url, token);
    console.log("Sdk initialized successfully", sdk);
  } catch (error) {
    console.error("Failed to initialize Sdk", error);
  }
}

main();
