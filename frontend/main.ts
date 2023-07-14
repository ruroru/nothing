import { invoke } from "@tauri-apps/api";
import { open, save } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface File {
  path: string;
  text: string;
}

const file: File = { path: "", text: "" };

const menuListener = listen("menu-event", async (event) => {
  switch (event.payload) {
    case "new-event":
      newEvent();
      break;
    case "open-event":
      openEvent();
      break;
    case "save-event":
      saveEvent();
      break;
    case "save-as-event":
      saveAsEvent();
      break;
    case "close-event":
      closeEvent();
      break;
  }
});

async function newEvent() {
  file.path = "";
  file.text = "";
  const filename = document.getElementById("filename");
  if (filename) {
    filename.innerText = file.path;
  }
  const editor = document.getElementById("editor");
  if (editor) {
    editor.contentEditable = "true";
    editor.innerText = file.text;
    editor.addEventListener("input", updateText);
    editor.addEventListener("input", renderHtml);
  }
  renderHtml();
  showApp();
}

async function openEvent() {
  file.path = (await open({
    filters: [
      {
        name: "Markdown",
        extensions: ["md"],
      },
    ],
  })) as string;
  file.text = await readTextFile(file.path);
  const filename = document.getElementById("filename");
  if (filename) {
    filename.innerText = file.path;
  }
  const editor = document.getElementById("editor");
  if (editor) {
    editor.contentEditable = "true";
    editor.innerText = file.text;
    editor.addEventListener("input", updateText);
    editor.addEventListener("input", renderHtml);
  }
  renderHtml();
  showApp();
}

async function saveEvent() {
  if (file.path.length === 0) {
    file.path = (await save({
      filters: [
        {
          name: "Markdown",
          extensions: ["md"],
        },
      ],
    })) as string;
  }
  await writeTextFile(file.path, file.text);
}

async function saveAsEvent() {
  file.path = (await save({
    defaultPath: file.path,
    filters: [
      {
        name: "Markdown",
        extensions: ["md"],
      },
    ],
  })) as string;
  await writeTextFile(file.path, file.text);
}

async function closeEvent() {
  const filename = document.getElementById("filename");
  if (filename) {
    filename.innerText = "";
  }
  const editor = document.getElementById("editor");
  if (editor) {
    editor.innerText = "";
    editor.contentEditable = "false";
    editor.removeEventListener("input", updateText);
    editor.removeEventListener("input", renderHtml);
  }
  const preview = document.getElementById("preview");
  if (preview) {
    preview.innerText = "";
  }
  hideApp();
}

async function updateText() {
  const editor = document.getElementById("editor");
  if (editor) {
    file.text = editor.innerText;
  }
}

async function renderHtml() {
  const preview = document.getElementById("preview");
  if (preview) {
    preview.innerHTML = DOMPurify.sanitize(marked(file.text));
  }
}

async function showApp() {
  const app = document.getElementById("app");
  if (app) {
    app.hidden = false;
  }
}

async function hideApp() {
  const app = document.getElementById("app");
  if (app) {
    app.hidden = true;
  }
}

async function showMainWindow() {
  invoke("show_main_window");
}

window.addEventListener("DOMContentLoaded", () => {
  menuListener;
  showMainWindow();
});
