use pulldown_cmark::{html, Options, Parser};

#[tauri::command]
fn render_markdown(markdown: String) -> Result<String, String> {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_STRIKETHROUGH);

    let parser = Parser::new_ext(&markdown, options);

    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);

    // Patch for GitHub-like classes
    html_output = html_output.replace("<ul>\n<li><input type=\"checkbox\"", "<ul class=\"contains-task-list\">\n<li class=\"task-list-item\"><input class=\"task-list-item-checkbox\" type=\"checkbox\"");
    html_output = html_output.replace(
        "<li><input type=\"checkbox\"",
        "<li class=\"task-list-item\"><input class=\"task-list-item-checkbox\" type=\"checkbox\"",
    );

    Ok(html_output)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![render_markdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
