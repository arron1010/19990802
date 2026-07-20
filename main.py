<think>The user wants a Windows Notepad program. Since the target platform is Windows EXE (Python + PyInstaller), I need to create a single main.py file that implements a simple Notepad-like text editor with common features.

Let me create a comprehensive but simple notepad with:
- File menu (New, Open, Save, Save As, Exit)
- Edit menu (Undo, Cut, Copy, Paste, Select All, Find, Replace)
- Format menu (Font, Word Wrap)
- Help menu (About)
- Status bar with line/column info
- Keyboard shortcuts (Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+Z, Ctrl+X, Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+F, Ctrl+H)
- Tab support (maybe multiple tabs or just single)
- Recent files
- Ask to save on exit if modified

I'll use tkinter which comes built-in with Python, so no external dependencies needed. This makes it easier to package with PyInstaller.

Let me write a clean, complete implementation.</think>

FILE: main.py
```python
# -*- coding: utf-8 -*-
"""
简易 Windows 记事本程序
使用 tkinter 实现，可通过 PyInstaller 打包成 EXE：
    pyinstaller --onefile --windowed --name "MyNotepad" main.py
"""

import os
import sys
import tkinter as tk
from tkinter import (
    Tk, Text, Menu, Message, filedialog, messagebox, simpledialog, font
)
from tkinter import ttk


APP_NAME = "简易记事本"


class Notepad:
    def __init__(self, root: Tk):
        self.root = root
        self.root.title(APP_NAME)
        self.root.geometry("900x600")
        self.root.minsize(400, 300)

        # 当前文件路径，None 表示尚未保存
        self.file_path: str | None = None
        # 是否被修改（用于标题栏 * 标记和退出确认）
        self.modified = False
        # 查找对话框实例
        self.find_dialog: tk.Toplevel | None = None
        self.find_entry: tk.Entry | None = None
        self.find_match_case = tk.BooleanVar(value=False)
        self.find_direction = tk.StringVar(value="down")
        self._find_last_pos = "1.0"

        self._build_ui()
        self._build_menu()
        self._build_status_bar()
        self._bind_events()
        self._update_title()
        self._update_status()

    # ------------------------ UI 构建 ------------------------
    def _build_ui(self):
        # 主框架
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # 滚动条
        self.v_scroll = ttk.Scrollbar(main_frame, orient=tk.VERTICAL)
        self.h_scroll = ttk.Scrollbar(main_frame, orient=tk.HORIZONTAL)

        # 文本框
        self.text = Text(
            main_frame,
            wrap=tk.NONE,
            undo=True,
            maxundo=-1,
            autoseparators=True,
            font=("Consolas", 11),
            tabs=("4c",),
            yscrollcommand=self.v_scroll.set,
            xscrollcommand=self.h_scroll.set,
            undo=True,
        )
        # Text 参数里 undo 重复了，这里再确认一次
        self.text.config(undo=True)

        self.v_scroll.config(command=self.text.yview)
        self.h_scroll.config(command=self.text.xview)

        # 网格布局
        self.text.grid(row=0, column=0, sticky="nsew")
        self.v_scroll.grid(row=0, column=1, sticky="ns")
        self.h_scroll.grid(row=1, column=0, sticky="ew")
        main_frame.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)

    def _build_menu(self):
        menubar = Menu(self.root)

        # 文件菜单
        file_menu = Menu(menubar, tearoff=False)
        file_menu.add_command(label="新建(N)\tCtrl+N", command=self.action_new)
        file_menu.add_command(label="打开(O)...\tCtrl+O", command=self.action_open)
        file_menu.add_command(label="保存(S)\tCtrl+S", command=self.action_save)
        file_menu.add_command(label="另存为(A)...\tCtrl+Shift+S", command=self.action_save_as)
        file_menu.add_separator()
        file_menu.add_command(label="退出(X)", command=self.on_close)
        menubar.add_cascade(label="文件(F)", menu=file_menu)

        # 编辑菜单
        edit_menu = Menu(menubar, tearoff=False)
        edit_menu.add_command(label="撤销(U)\tCtrl+Z", command=self.action_undo)
        edit_menu.add_command(label="重做(R)\tCtrl+Y",