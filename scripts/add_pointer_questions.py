#!/usr/bin/env python3
"""Add pointers section questions (q103–q110) and update index.json."""

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
        "id": "q103-swap-two-integers-using-pointers",
        "file": "q103-swap-two-integers-using-pointers.md",
        "title": "Swap Two Integers Using Pointers",
        "pattern": "pointer parameters",
        "difficulty": "easy",
        "section": "pointers",
        "expectedOutput": "before: a=3 b=7\\nafter:  a=7 b=3\\n",
        "description": "Write `void swap(int *pa, int *pb)` that exchanges the values at two addresses.",
        "algorithm": """step1: Save *pa in a temporary variable
step2: Write *pb into *pa
step3: Write the saved value into *pb""",
        "example": "a=3, b=7 → after swap a=7, b=3",
        "func": """void swap(int *pa, int *pb) {
    int tmp = *pa;
    *pa = *pb;
    *pb = tmp;
}""",
        "main": """    int a = 3, b = 7;
    printf("before: a=%d b=%d\\n", a, b);
    swap(&a, &b);
    printf("after:  a=%d b=%d\\n", a, b);""",
    },
    {
        "id": "q104-reverse-array-with-pointer-walking",
        "file": "q104-reverse-array-with-pointer-walking.md",
        "title": "Reverse Array with Pointer Walking",
        "pattern": "pointer arithmetic",
        "difficulty": "easy",
        "section": "pointers",
        "expectedOutput": "reversed: 5 4 3 2 1\n",
        "description": "Reverse an array in-place using two pointers (`left` and `right`) — no index subscripts in the loop body.",
        "algorithm": """step1: left = arr, right = arr + n - 1
step2: While left < right: swap *left and *right, then left++, right--
step3: Print the reversed array""",
        "example": "[1,2,3,4,5] → [5,4,3,2,1]",
        "func": """void reverseWithPtrs(int *arr, int n) {
    int *left = arr;
    int *right = arr + n - 1;
    while (left < right) {
        int t = *left;
        *left = *right;
        *right = t;
        left++;
        right--;
    }
}""",
        "main": """    int a[] = {1, 2, 3, 4, 5};
    reverseWithPtrs(a, 5);
    printf("reversed:");
    for (int i = 0; i < 5; i++) printf(" %d", a[i]);
    printf("\\n");""",
    },
    {
        "id": "q105-insert-at-head-double-pointer",
        "file": "q105-insert-at-head-double-pointer.md",
        "title": "Insert at Head with Node **head",
        "pattern": "pointer-to-pointer",
        "difficulty": "medium",
        "section": "pointers",
        "visualization": "linked-list",
        "expectedOutput": "list: 30 -> 20 -> 10 -> NULL\n",
        "description": "Implement `insertAtHead(Node **head, int id)` so the caller's head pointer updates when the list was empty or already had nodes.",
        "algorithm": """step1: Allocate a new node
step2: new->next = *head
step3: *head = new   (write through the double pointer)""",
        "example": "Insert 10, 20, 30 at head → 30 -> 20 -> 10 -> NULL",
        "typedef": "typedef struct Node { int id; struct Node *next; } Node;\n",
        "func": """void insertAtHead(Node **head, int id) {
    Node *n = (Node *)malloc(sizeof *n);
    n->id = id;
    n->next = *head;
    *head = n;
}""",
        "main": """    Node *head = NULL;
    insertAtHead(&head, 10);
    insertAtHead(&head, 20);
    insertAtHead(&head, 30);
    printf("list:");
    for (Node *c = head; c; c = c->next) printf(" %d ->", c->id);
    printf(" NULL\\n");
    while (head) { Node *t = head->next; free(head); head = t; }""",
    },
    {
        "id": "q106-pointer-to-array-vs-array-of-pointers",
        "file": "q106-pointer-to-array-vs-array-of-pointers.md",
        "title": "Pointer to Array vs Array of Pointers",
        "pattern": "pointer types",
        "difficulty": "medium",
        "section": "pointers",
        "expectedOutput": "row via (*prow)[i]: 10 20 30\nnames[1]: bob\n",
        "description": "Demonstrate `( *rowPtr )[COLS]` (pointer to one row) versus `char *names[]` (array of string pointers).",
        "algorithm": """step1: int grid[2][3] — use int (*prow)[3] = grid + 1 to point at row 1
step2: Print row through (*prow)[i]
step3: char *names[] = {\"alice\", \"bob\"}; print names[1]""",
        "example": "Row pointer reads 10 20 30; name pointer reads bob",
        "func": """void printRow(int (*row)[3]) {
    for (int i = 0; i < 3; i++) printf(" %d", (*row)[i]);
    printf("\\n");
}""",
        "main": """    int grid[2][3] = {{1,2,3},{10,20,30}};
    int (*prow)[3] = grid + 1;
    printf("row via (*prow)[i]:");
    printRow(prow);
    const char *names[] = {"alice", "bob", "carol"};
    printf("names[1]: %s\\n", names[1]);""",
    },
    {
        "id": "q107-modify-array-through-pointer-parameter",
        "file": "q107-modify-array-through-pointer-parameter.md",
        "title": "Modify Array Through Pointer Parameter",
        "pattern": "pointer parameter",
        "difficulty": "easy",
        "section": "pointers",
        "expectedOutput": "scaled: 2 4 6 8 10\n",
        "description": "Implement `void scale(int *arr, int n, int factor)` that multiplies every element through pointer walking.",
        "algorithm": """step1: end = arr + n
step2: Walk p from arr to end-1, doing *p *= factor""",
        "example": "[1,2,3,4,5] with factor 2 → [2,4,6,8,10]",
        "func": """void scale(int *arr, int n, int factor) {
    int *end = arr + n;
    for (int *p = arr; p < end; p++)
        *p *= factor;
}""",
        "main": """    int a[] = {1, 2, 3, 4, 5};
    scale(a, 5, 2);
    printf("scaled:");
    for (int i = 0; i < 5; i++) printf(" %d", a[i]);
    printf("\\n");""",
    },
    {
        "id": "q108-sort-array-of-string-pointers",
        "file": "q108-sort-array-of-string-pointers.md",
        "title": "Sort an Array of String Pointers",
        "pattern": "array of pointers",
        "difficulty": "medium",
        "section": "pointers",
        "expectedOutput": "sorted: apple banana cherry date\n",
        "description": "Sort `char *words[]` lexicographically by swapping pointer values (not copying strings).",
        "algorithm": """step1: Nested loops over indices i and j
step2: If strcmp(words[i], words[j]) > 0, swap the pointer slots""",
        "example": "delta, apple, cherry, banana → apple banana cherry delta",
        "func": """void sortWords(char *words[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = i + 1; j < n; j++)
            if (strcmp(words[i], words[j]) > 0) {
                char *t = words[i];
                words[i] = words[j];
                words[j] = t;
            }
}""",
        "main": """    char *words[] = {"delta", "apple", "cherry", "banana"};
    sortWords(words, 4);
    printf("sorted:");
    for (int i = 0; i < 4; i++) printf(" %s", words[i]);
    printf("\\n");""",
    },
    {
        "id": "q109-delete-node-double-pointer",
        "file": "q109-delete-node-double-pointer.md",
        "title": "Delete Node with Node **cursor",
        "pattern": "pointer-to-pointer",
        "difficulty": "medium",
        "section": "pointers",
        "visualization": "linked-list",
        "expectedOutput": "after delete 20: 10 -> 30 -> NULL\n",
        "description": "Delete the first node with a given key using `Node **cur` so you can update the previous `next` pointer (including head).",
        "algorithm": """step1: while *cur != NULL
step2:   if (*cur)->id == key: save node, *cur = node->next, free node, return
step3:   cur = &((*cur)->next)   (address of next field — double pointer walk)""",
        "example": "10->20->30, delete 20 → 10->30",
        "typedef": "typedef struct Node { int id; struct Node *next; } Node;\n",
        "func": """void deleteByKey(Node **cur, int key) {
    while (*cur) {
        if ((*cur)->id == key) {
            Node *gone = *cur;
            *cur = gone->next;
            free(gone);
            return;
        }
        cur = &((*cur)->next);
    }
}""",
        "main": """    Node *head = NULL, **tail = &head;
    for (int id = 10; id <= 30; id += 10) {
        *tail = (Node *)malloc(sizeof **tail);
        (*tail)->id = id;
        (*tail)->next = NULL;
        tail = &((*tail)->next);
    }
    deleteByKey(&head, 20);
    printf("after delete 20:");
    for (Node *c = head; c; c = c->next) printf(" %d ->", c->id);
    printf(" NULL\\n");
    while (head) { Node *t = head->next; free(head); head = t; }""",
    },
    {
        "id": "q110-return-min-max-via-output-pointers",
        "file": "q110-return-min-max-via-output-pointers.md",
        "title": "Return Min and Max via Output Pointers",
        "pattern": "output parameters",
        "difficulty": "easy",
        "section": "pointers",
        "expectedOutput": "min=2 max=15\n",
        "description": "Implement `void minMax(const int *arr, int n, int *outMin, int *outMax)` using pointer parameters to return two results.",
        "algorithm": """step1: *outMin = *outMax = *arr
step2: Walk p from arr+1 to arr+n, updating *outMin / *outMax""",
        "example": "[8,2,15,4] → min=2 max=15",
        "func": """void minMax(const int *arr, int n, int *outMin, int *outMax) {
    *outMin = *outMax = arr[0];
    for (const int *p = arr + 1; p < arr + n; p++) {
        if (*p < *outMin) *outMin = *p;
        if (*p > *outMax) *outMax = *p;
    }
}""",
        "main": """    int a[] = {8, 2, 15, 4};
    int lo, hi;
    minMax(a, 4, &lo, &hi);
    printf("min=%d max=%d\\n", lo, hi);""",
    },
]


def build_md(q: dict) -> str:
    typedef = q.get("typedef", "")
    viz = q.get("visualization", "generic")
    return f"""---
id: "{q['id']}"
title: "{q['title']}"
pattern: "{q['pattern']}"
difficulty: "{q['difficulty']}"
visualization: "{viz}"
vizCategory: "pointers"
stdin: ""
expectedOutput: "{q['expectedOutput']}"
---
## At a glance

- **Goal:** {q['title']}
- **Pattern:** {q['pattern'].replace('_', ' ').title()}
- **Expected output:** `{q['expectedOutput'].strip()}`

## Description

{q['description']}

## Algorithm

```text
{q['algorithm']}
```

## Example Trace

```text
{q['example']}
```

## Starter Code

```c
{HEADER}{typedef}/* TODO: implement the helper function(s) your main needs */

int main(void) {{
{q['main']}
    return 0;
}}
```

## Solution

```c
{HEADER}{typedef}{q['func']}

int main(void) {{
{q['main']}
    return 0;
}}
```
"""


def main() -> None:
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    existing = {q["id"] for q in index["questions"]}
    added = 0
    for q in NEW:
        if q["id"] in existing:
            continue
        path = QUESTIONS / q["file"]
        path.write_text(build_md(q), encoding="utf-8")
        index["questions"].append(
            {
                "id": q["id"],
                "file": q["file"],
                "title": q["title"],
                "pattern": q["pattern"],
                "difficulty": q["difficulty"],
                "section": q["section"],
            }
        )
        added += 1
        print(f"  + {q['id']}")
    INDEX.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    print(f"Added {added} pointer questions ({len(index['questions'])} total).")


if __name__ == "__main__":
    main()
