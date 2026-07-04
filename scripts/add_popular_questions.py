#!/usr/bin/env python3
"""Add 9 popular interview questions (91 → 100) and update index.json."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = ROOT / "questions"
INDEX = QUESTIONS / "index.json"

HEADER = """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
"""

NEW = [
    {
        "id": "q94-two-sum-sorted-array",
        "file": "q94-two-sum-sorted-array.md",
        "title": "Two Sum (sorted array, two-pointer)",
        "pattern": "two-pointer (opposite ends)",
        "difficulty": "medium",
        "section": "arrays",
        "complexity": "O(n) time, O(1) space",
        "expectedOutput": "twoSum([2,7,11,15],9) -> 0,1\n",
        "description": "Given a **sorted** array and a target, return indices of two numbers that add up to target (classic FAANG warm-up).",
        "example": "arr = [2, 7, 11, 15], target = 9 → indices 0 and 1",
        "algorithm": """step1: left = 0, right = n - 1
step2: While left < right: sum = arr[left] + arr[right]
step3: If sum == target, return left and right
step4: If sum < target, left++; else right--
step5: Return -1 if no pair found""",
        "trace_example": """arr = [2, 7, 11, 15], target = 9
  left=0, right=3: 2+15=17 > 9 → right--
  left=0, right=2: 2+11=13 > 9 → right--
  left=0, right=1: 2+7=9  → FOUND (0, 1)""",
        "func": """int twoSum(const int arr[], int n, int target, int *i, int *j) {
    int left = 0, right = n - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) { *i = left; *j = right; return 1; }
        if (sum < target) left++;
        else right--;
    }
    return 0;
}""",
        "main": """    int a[] = {2, 7, 11, 15};
    int i, j;
    if (twoSum(a, 4, 9, &i, &j))
        printf("twoSum([2,7,11,15],9) -> %d,%d\\n", i, j);
    else
        printf("no pair\\n");""",
    },
    {
        "id": "q95-contains-duplicate",
        "file": "q95-contains-duplicate.md",
        "title": "Contains Duplicate",
        "pattern": "frequency table (boolean variant)",
        "difficulty": "easy",
        "section": "arrays",
        "complexity": "O(n) time, O(n) space",
        "expectedOutput": "containsDuplicate([1,2,3,1])=1\\ncontainsDuplicate([1,2,3,4])=0\\n",
        "description": "Return true if any value appears at least twice in the array.",
        "example": "arr = [1, 2, 3, 1] → duplicate exists",
        "algorithm": """step1: Create a seen[] table (or hash set)
step2: For each element arr[i]:
step3:   If already seen, return 1 (true)
step4:   Mark arr[i] as seen
step5: Return 0 (false) if loop finishes""",
        "trace_example": """arr = [1, 2, 3, 1]
  i=0: seen[1]=false → mark seen
  i=1: seen[2]=false → mark seen
  i=2: seen[3]=false → mark seen
  i=3: seen[1]=true  → DUPLICATE FOUND""",
        "func": """int containsDuplicate(const int arr[], int n) {
    int seen[100001] = {0};
    for (int i = 0; i < n; i++) {
        if (seen[arr[i] + 50000]) return 1;
        seen[arr[i] + 50000] = 1;
    }
    return 0;
}""",
        "main": """    int a1[] = {1, 2, 3, 1}, a2[] = {1, 2, 3, 4};
    printf("containsDuplicate([1,2,3,1])=%d\\n", containsDuplicate(a1, 4));
    printf("containsDuplicate([1,2,3,4])=%d\\n", containsDuplicate(a2, 4));""",
    },
    {
        "id": "q96-best-time-to-buy-and-sell-stock",
        "file": "q96-best-time-to-buy-and-sell-stock.md",
        "title": "Best Time to Buy and Sell Stock",
        "pattern": "single pass (track min, max profit)",
        "difficulty": "easy",
        "section": "arrays",
        "complexity": "O(n) time, O(1) space",
        "expectedOutput": "maxProfit=5\\n",
        "description": "One transaction: buy once, sell once later. Return maximum profit (0 if none).",
        "example": "prices = [7, 1, 5, 3, 6, 4] → buy at 1, sell at 6, profit = 5",
        "algorithm": """step1: minPrice = prices[0], maxProfit = 0
step2: For each price from index 1:
step3:   Update minPrice = min(minPrice, price)
step4:   maxProfit = max(maxProfit, price - minPrice)
step5: Return maxProfit""",
        "trace_example": """prices = [7, 1, 5, 3, 6, 4]
  i=1: min=1, profit=max(0,1-1)=0
  i=2: min=1, profit=max(0,5-1)=4
  i=4: min=1, profit=max(4,6-1)=5  ← answer""",
        "func": """int maxProfit(const int prices[], int n) {
    if (n < 2) return 0;
    int minP = prices[0], best = 0;
    for (int i = 1; i < n; i++) {
        if (prices[i] < minP) minP = prices[i];
        else {
            int p = prices[i] - minP;
            if (p > best) best = p;
        }
    }
    return best;
}""",
        "main": """    int p[] = {7, 1, 5, 3, 6, 4};
    printf("maxProfit=%d\\n", maxProfit(p, 6));""",
    },
    {
        "id": "q97-implement-atoi-string-to-integer",
        "file": "q97-implement-atoi-string-to-integer.md",
        "title": "Implement atoi (String to Integer)",
        "pattern": "state machine (single pass)",
        "difficulty": "medium",
        "section": "strings",
        "complexity": "O(n) time, O(1) space",
        "expectedOutput": "atoi(\"42\")=42\\natoi(\"  -4193\")=-4193\\n",
        "description": "Convert a string to a 32-bit signed integer (like C's `atoi`): skip whitespace, optional sign, read digits.",
        "example": 's = "  -4193 abc" → -4193',
        "algorithm": """step1: Skip leading whitespace
step2: Read optional '+' or '-' sign
step3: While next char is digit: result = result*10 + digit
step4: Apply sign and clamp to INT range if needed
step5: Return result""",
        "trace_example": """s = "  -4193"
  skip spaces → '-'
  sign = -1
  read '4','1','9','3' → result = 4193
  return -4193""",
        "func": """int myAtoi(const char *s) {
    while (*s == ' ' || *s == '\\t') s++;
    int sign = 1;
    if (*s == '-' || *s == '+') { if (*s == '-') sign = -1; s++; }
    long val = 0;
    while (*s >= '0' && *s <= '9') {
        val = val * 10 + (*s - '0');
        if (val * sign > INT_MAX) return INT_MAX;
        if (val * sign < INT_MIN) return INT_MIN;
        s++;
    }
    return (int)(val * sign);
}""",
        "main": """    printf("atoi(\\"42\\")=%d\\n", myAtoi("42"));
    printf("atoi(\\"  -4193\\")=%d\\n", myAtoi("  -4193"));""",
    },
    {
        "id": "q98-longest-substring-without-repeating-characters",
        "file": "q98-longest-substring-without-repeating-characters.md",
        "title": "Longest Substring Without Repeating Characters",
        "pattern": "sliding window + frequency table",
        "difficulty": "medium",
        "section": "strings",
        "complexity": "O(n) time, O(1) space (ASCII)",
        "expectedOutput": "lengthOfLongestSubstring(\"abcabcbb\")=3\\n",
        "description": "Find the length of the longest substring with all unique characters (classic sliding window).",
        "example": 's = "abcabcbb" → "abc" has length 3',
        "algorithm": """step1: left = 0, best = 0, freq[256] = {0}
step2: For right from 0 to end:
step3:   While s[right] already in window: shrink from left
step4:   Mark s[right] seen, update best = max(best, right-left+1)
step5: Return best""",
        "trace_example": """s = "abcabcbb"
  window "abc" len=3, then 'a' repeats → shrink
  best stays 3 through end""",
        "func": """int lengthOfLongestSubstring(const char *s) {
    int freq[256] = {0}, left = 0, best = 0;
    for (int right = 0; s[right]; right++) {
        while (freq[(unsigned char)s[right]]) {
            freq[(unsigned char)s[left]]--;
            left++;
        }
        freq[(unsigned char)s[right]] = 1;
        int len = right - left + 1;
        if (len > best) best = len;
    }
    return best;
}""",
        "main": """    printf("lengthOfLongestSubstring(\\"abcabcbb\\")=%d\\n",
           lengthOfLongestSubstring("abcabcbb"));""",
    },
    {
        "id": "q99-merge-two-sorted-linked-lists",
        "file": "q99-merge-two-sorted-linked-lists.md",
        "title": "Merge Two Sorted Linked Lists",
        "pattern": "linked list",
        "difficulty": "medium",
        "section": "linked list",
        "complexity": "O(n + m) time, O(1) space",
        "expectedOutput": "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL\\n",
        "description": "Merge two sorted singly linked lists into one sorted list.",
        "example": "list1: 1→2→4, list2: 1→3→4 → 1→1→2→3→4→4",
        "algorithm": """step1: Dummy head node, tail pointer
step2: While both lists non-NULL: attach smaller node
step3: Attach remaining list
step4: Return dummy.next""",
        "trace_example": """Compare heads: 1 vs 1 → take first 1
Then 2 vs 1 → take 1 from list2
Continue until both exhausted""",
        "typedef": "typedef struct Node { int id; struct Node *next; } Node;\n",
        "func": """Node *mergeLists(Node *a, Node *b) {
    Node dummy = {0, NULL}, *tail = &dummy;
    while (a && b) {
        if (a->id <= b->id) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}""",
        "main": """    Node *a = NULL, *b = NULL;
    int v1[] = {4, 2, 1}, v2[] = {4, 3, 1};
    for (int i = 0; i < 3; i++) {
        Node *n = malloc(sizeof *n);
        n->id = v1[i]; n->next = a; a = n;
    }
    for (int i = 0; i < 3; i++) {
        Node *n = malloc(sizeof *n);
        n->id = v2[i]; n->next = b; b = n;
    }
    Node *h = mergeLists(a, b);
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
    printf("NULL\\n");
    while (h) { Node *t = h->next; free(h); h = t; }""",
    },
    {
        "id": "q100-remove-nth-node-from-end",
        "file": "q100-remove-nth-node-from-end.md",
        "title": "Remove Nth Node From End of List",
        "pattern": "linked list (two-pointer / dummy head)",
        "difficulty": "medium",
        "section": "linked list",
        "complexity": "O(n) time, O(1) space",
        "expectedOutput": "1 -> 2 -> 4 -> NULL\\n",
        "description": "Remove the nth node from the end of a singly linked list in one pass (fast/slow gap trick).",
        "example": "1→2→3→4→5, n=2 → remove 4 → 1→2→3→5",
        "algorithm": """step1: Dummy node before head; slow = fast = dummy
step2: Advance fast n+1 steps
step3: Move both until fast reaches end
step4: slow->next = slow->next->next (skip target node)""",
        "trace_example": """list 1→2→3→4→5, n=2
  gap of 2: slow stops before node 4 → remove 4""",
        "typedef": "typedef struct Node { int id; struct Node *next; } Node;\n",
        "func": """Node *removeNthFromEnd(Node *head, int n) {
    Node dummy = {0, head}, *slow = &dummy, *fast = &dummy;
    for (int i = 0; i <= n; i++) fast = fast->next;
    while (fast) { slow = slow->next; fast = fast->next; }
    Node *del = slow->next;
    slow->next = del ? del->next : NULL;
    if (del) free(del);
    return dummy.next;
}""",
        "main": """    Node *h = NULL;
    for (int i = 5; i >= 1; i--) { Node *n=malloc(sizeof*n); n->id=i; n->next=h; h=n; }
    h = removeNthFromEnd(h, 2);
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
    printf("NULL\\n");
    while (h) { Node *t = h->next; free(h); h = t; }""",
    },
    {
        "id": "q101-valid-parentheses",
        "file": "q101-valid-parentheses.md",
        "title": "Valid Parentheses",
        "pattern": "stack (array-backed)",
        "difficulty": "easy",
        "section": "queues & stacks",
        "complexity": "O(n) time, O(n) space",
        "expectedOutput": "isValid(\"()\")=1\\nisValid(\"(]\")=0\\n",
        "description": "Given a string of brackets `()[]{}`, determine if it is valid (every opener has a matching closer in order).",
        "example": 's = "{[]}" → valid; s = "(]" → invalid',
        "algorithm": """step1: Stack of opening brackets
step2: For each char: if opener, push; if closer, pop must match
step3: Valid iff stack empty at end""",
        "trace_example": """s = "{[]}"
  push {, push [, pop [ with ], pop { with } → empty → valid""",
        "func": """int isValid(const char *s) {
    char st[128];
    int top = 0;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') st[top++] = c;
        else {
            if (!top) return 0;
            char o = st[--top];
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                return 0;
        }
    }
    return top == 0;
}""",
        "main": """    printf("isValid(\\"()\\")=%d\\n", isValid("()"));
    printf("isValid(\\"(]\\")=%d\\n", isValid("(]"));""",
    },
    {
        "id": "q102-fibonacci-number-iterative",
        "file": "q102-fibonacci-number-iterative.md",
        "title": "Fibonacci Number (iterative)",
        "pattern": "math / number",
        "difficulty": "easy",
        "section": "math / number",
        "complexity": "O(n) time, O(1) space",
        "expectedOutput": "fib(0)=0\\nfib(1)=1\\nfib(10)=55\\n",
        "description": "Return the nth Fibonacci number F(n) where F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2). Use iteration (no recursion).",
        "example": "fib(10) = 55",
        "algorithm": """step1: If n <= 1 return n
step2: a=0, b=1
step3: For i from 2 to n: c=a+b; a=b; b=c
step4: Return b""",
        "trace_example": """n=5: 0,1,1,2,3,5 → return 5""",
        "func": """int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}""",
        "main": """    printf("fib(0)=%d\\n", fib(0));
    printf("fib(1)=%d\\n", fib(1));
    printf("fib(10)=%d\\n", fib(10));""",
    },
]


def build_md(q: dict) -> str:
    typedef = q.get("typedef", "")
    goal = q["title"]
    pattern = q["pattern"][0].upper() + q["pattern"][1:]
    starter_main = q["main"].replace("\n", "\n    ")
    solution_main = starter_main

    return f"""---
id: {json.dumps(q["id"])}
title: {json.dumps(q["title"])}
pattern: {json.dumps(q["pattern"])}
difficulty: {json.dumps(q["difficulty"])}
visualization: "generic"
vizCategory: {json.dumps(q["section"])}
stdin: ""
complexity: {json.dumps(q["complexity"])}
expectedOutput: {json.dumps(q["expectedOutput"])}
---
## At a glance

- **Goal:** {goal}
- **Pattern:** {pattern}
- **Complexity:** {q["complexity"]}
- **Expected output:** `{q["expectedOutput"].strip().split(chr(10))[0]}`

## Description

{q["description"]}

**Walkthrough hint:**

{q["example"]}

## Algorithm

```text
{q["algorithm"]}
```

## Example Trace

```text
{q["trace_example"]}
```

## Starter Code

```c
{HEADER}{typedef}/* TODO: implement the helper function(s) your main needs */

int main(void) {{
    {starter_main}
    return 0;
}}
```

## Solution

```c
{HEADER}{typedef}{q["func"]}

int main(void) {{
    {solution_main}
    return 0;
}}
```
"""


def main():
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    existing_ids = {q["id"] for q in index["questions"]}

    added = 0
    for q in NEW:
        if q["id"] in existing_ids:
            continue
        path = QUESTIONS / q["file"]
        path.write_text(build_md(q), encoding="utf-8")
        index["questions"].append({
            "id": q["id"],
            "file": q["file"],
            "title": q["title"],
            "pattern": q["pattern"],
            "difficulty": q["difficulty"],
            "section": q["section"],
        })
        added += 1
        print(f"  + {q['id']}")

    INDEX.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    print(f"Added {added} questions. Total: {len(index['questions'])}")


if __name__ == "__main__":
    main()
