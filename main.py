import tkinter as tk
from tkinter import ttk
import math

class Calculator:
    def __init__(self, root):
        self.root = root
        self.root.title("计算器")
        self.root.geometry("320x450")
        self.root.resizable(False, False)

        # 显示区域
        self.display_var = tk.StringVar()
        self.display_var.set("0")
        self.expression = ""

        self.create_widgets()

    def create_widgets(self):
        # 显示框
        display_frame = ttk.Frame(self.root)
        display_frame.pack(expand=True, fill="both", padx=10, pady=10)
        display_entry = ttk.Entry(display_frame, textvariable=self.display_var,
                                  font=("Arial", 24), justify="right", state="readonly")
        display_entry.pack(expand=True, fill="both")

        # 按钮区域
        btn_frame = ttk.Frame(self.root)
        btn_frame.pack(expand=True, fill="both", padx=10, pady=(0,10))

        buttons = [
            ["AC", "⌫", "%", "÷"],
            ["7", "8", "9", "×"],
            ["4", "5", "6", "-"],
            ["1", "2", "3", "+"],
            ["0", ".", "="]
        ]

        for i, row in enumerate(buttons):
            for j, text in enumerate(row):
                # 特殊处理 0 和 = 的跨列
                if text == "0":
                    btn = ttk.Button(btn_frame, text=text, command=lambda t=text: self.on_button(t))
                    btn.grid(row=i, column=j, columnspan=2, sticky="nsew", padx=2, pady=2)
                elif text == "=":
                    btn = ttk.Button(btn_frame, text=text, command=lambda t=text: self.on_button(t))
                    btn.grid(row=i, column=j, columnspan=2, sticky="nsew", padx=2, pady=2)
                else:
                    btn = ttk.Button(btn_frame, text=text, command=lambda t=text: self.on_button(t))
                    btn.grid(row=i, column=j, sticky="nsew", padx=2, pady=2)

        # 配置网格权重
        for i in range(5):
            btn_frame.grid_rowconfigure(i, weight=1)
        for j in range(4):
            btn_frame.grid_columnconfigure(j, weight=1)

    def on_button(self, char):
        if char == "AC":
            self.clear()
        elif char == "⌫":
            self.backspace()
        elif char == "=":
            self.calculate()
        elif char == "%":
            self.percent()
        else:
            self.append_char(char)

    def append_char(self, char):
        # 处理连续运算符替换
        if char in "+-×÷" and self.expression and self.expression[-1] in "+-×÷":
            self.expression = self.expression[:-1] + char
        else:
            self.expression += char
        self.update_display()

    def backspace(self):
        self.expression = self.expression[:-1]
        if not self.expression:
            self.expression = ""
            self.display_var.set("0")
        else:
            self.update_display()

    def clear(self):
        self.expression = ""
        self.display_var.set("0")

    def percent(self):
        try:
            self.expression = str(eval(self.expression + "/100"))
        except:
            self.display_var.set("错误")
            self.expression = ""
        self.update_display()

    def calculate(self):
        if not self.expression:
            return
        # 替换显示符号为Python运算符号
        expr = self.expression.replace("×", "*").replace("÷", "/")
        try:
            result = eval(expr)
            # 处理整数显示
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            self.display_var.set(str(result))
            self.expression = str(result)
        except:
            self.display_var.set("错误")
            self.expression = ""

    def update_display(self):
        if not self.expression:
            self.display_var.set("0")
        else:
            self.display_var.set(self.expression)

if __name__ == "__main__":
    root = tk.Tk()
    app = Calculator(root)
    root.mainloop()