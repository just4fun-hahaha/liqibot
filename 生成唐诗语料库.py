import re
pattern = re.compile(r'.*[a-zA-Z0-9］（].*')

with open('唐诗.txt', encoding="GB2312") as f:
    for i in f:
        text = i.strip()
        if len(text) < 10:
            continue
        match = pattern.match(text)
        if match:
            continue
        print(text)
