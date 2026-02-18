const saver = {
  save: () => {
    const options = {
      layout: layout.current,
      orientation: layout.orientation,
      markdown: editor.innerText,
    };
    localStorage.setItem('options', JSON.stringify(options));
  },
  load: async () => {
    const stored = localStorage.getItem('options');
    if (!stored) return await loadSample();
    const options = JSON.parse(stored);

    const markdown = options.markdown;
    if (markdown && markdown !== "" && markdown !== "\n") {
      editor.textContent = markdown;
      converter.update();
    } else await loadSample();

    setLayout(options.layout);
    setOrientation(options.orientation);
  },
  clear: () => localStorage.removeItem('markdown'),
};



const { invoke } = window.__TAURI__.core;
const editor = document.getElementById("markdown");
const preview = document.getElementById("preview");

const layout = {
  current: 0,
  orientation: 0,
  orientationList: ['row', 'column', 'row-reverse', 'column-reverse'],
  list:
    [
      {
        editor: 'flex',
        preview: 'flex',
      },
      {
        editor: 'none',
        preview: 'flex',
      },
      {
        editor: 'flex',
        preview: 'none',
      }
    ]
};

function setOrientation(orientation = 0) {
  layout.orientation = orientation;
  main.style.flexDirection = layout.orientationList[orientation];
}
function setLayout(index = 0) {
  layout.current = index;
  editor.parentElement.style.display = layout.list[index].editor;
  preview.parentElement.style.display = layout.list[index].preview;
}
document.getElementById("editor-preview").addEventListener("click", () => {
  const next = (layout.current + 1 === layout.list.length) ? 0 : layout.current + 1;
  setLayout(next);
  saver.save();
});

const main = document.getElementById("main");
document.getElementById("orientation").addEventListener("click", () => {
  const next = (layout.orientation + 1 === layout.orientationList.length) ? 0 : layout.orientation + 1;
  setOrientation(next);
  saver.save();
});

async function loadSample() {
  const response = await fetch("sample.md");
  const markdown = await response.text();
  editor.textContent = markdown;
  converter.update();
}
document.getElementById("load-sample").addEventListener("click", loadSample);

const converter = {
  timeout: null,
  delay: 500,
  htmlHeader: `<!DOCTYPE html><html lang="en"><head><link rel="stylesheet" href="assets/css/primer.css"><link rel="stylesheet" href="assets/css/iframe.css"></head><body class="markdown-body">`,
  htmlFooter: `</body></html>`,
  async getHtml() {
    const htmlCode = await invoke("render_markdown", { markdown: editor.innerText });
    return converter.htmlHeader + htmlCode + converter.htmlFooter;
  },
  update() {
    if (converter.timeout) clearTimeout(converter.timeout);
    converter.timeout = setTimeout(async () => {
      preview.srcdoc = await converter.getHtml();
      saver.save();
    }, converter.delay);
  }
};

editor.addEventListener("input", converter.update);

window.onload = async () => {
  saver.load();
};