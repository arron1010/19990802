<think>The user wants a Windows Notepad program. I need to create a Python program that implements a simple notepad application with typical features like:
- File operations (New, Open, Save, Save As)
- Edit operations (Cut, Copy, Paste, Undo, Redo, Select All, Find, Replace)
- Formatting options (Font, Word Wrap)
- Status bar
- About dialog

I'll create a comprehensive notepad application using tkinter (built into Python). The program should be packaged as a Windows EXE using PyInstaller.

Let me design a feature-rich notepad:

1. Menu bar with File, Edit, Format, View, Help menus
2. Text area with scrollbars
3. Status bar showing line/column
4. Recent file tracking
5. Find and Replace dialogs
6. Font selection
7. Word wrap toggle
8. Dark/light mode
9. Tab support
10. Drag and drop file support
11. Proper handling of unsaved changes

Let me write this comprehensively in a single main.py file.</think>

FILE: main.py
```python
# -*- coding: utf-8 -*-
"""
Windows Notepad Clone
A feature-rich notepad application built with tkinter.
"""

import os
import sys
import tkinter as tk
from tkinter import ttk, font, filedialog, messagebox, colorchooser
import re
from datetime import datetime


# ----------------------------- Find/Replace Dialog -----------------------------

class FindReplaceDialog(tk.Toplevel):
    def __init__(self, parent, app):
        super().__init__(parent)
        self.app = app
        self.title("查找和替换" if "replace" in str(self) else "查找")
        self.transient(parent)
        self.resizable(False, False)
        self.configure(bg=app.theme["bg"])

        self.last_search = ""
        self.matches = []
        self.current_match_index = -1

        self._build_ui()

    def _build_ui(self):
        pad = {"padx": 6, "pady": 4}

        ttk.Label(self, text="查找:").grid(row=0, column=0, sticky="e", **pad)
        self.find_entry = ttk.Entry(self, width=30)
        self.find_entry.grid(row=0, column=1, columnspan=3, sticky="we", **pad)
        self.find_entry.focus_set()

        ttk.Label(self, text="替换为:").grid(row=1, column=0, sticky="e", **pad)
        self.replace_entry = ttk.Entry(self, width=30)
        self.replace_entry.grid(row=1, column=1, columnspan=3, sticky="we", **pad)

        self.case_sensitive_var = tk.BooleanVar()
        ttk.Checkbutton(self, text="区分大小写", variable=self.case_sensitive_var).grid(
            row=2, column=0, columnspan=2, sticky="w", **pad)

        self.wrap_around_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(self, text="循环查找", variable=self.wrap_around_var).grid(
            row=2, column=2, columnspan=2, sticky="w", **pad)

        ttk.Button(self, text="查找下一个", command=self.find_next).grid(
            row=3, column=0, columnspan=2, sticky="we", **pad)
        ttk.Button(self, text="替换", command=self.replace_one).grid(
            row=3, column=2, sticky="we", **pad)
        ttk.Button(self, text="全部替换", command=self.replace_all).grid(
            row=3, column=3, sticky="we", **pad)

        ttk.Button(self, text="关闭", command=self.destroy).grid(
            row=4, column=2, columnspan=2, sticky="we", **pad)

        self.find_entry.bind("<Return>", lambda e: self.find_next())
        self.replace_entry.bind("<Return>", lambda e: self.replace_one())
        self.bind("<Escape>", lambda e: self.destroy())

        self.status_var = tk.StringVar(value="")
        ttk.Label(self, textvariable=self.status_var, foreground="blue").grid(
            row=5, column=0, columnspan=4, sticky="w", **pad)

        self.protocol("WM_DELETE_WINDOW", self.destroy)

    def _get_text_widget(self):
        return self.app.text

    def find_next(self, from_start=False):
        pattern = self.find_entry.get()
        if not pattern:
            return
        widget = self._get_text_widget()
        try:
            if self.case_sensitive_var.get():
                start_index = "1.0" if from_start else widget.index(tk.INSERT)
                pos = widget.search(pattern, start_index, stopindex=tk