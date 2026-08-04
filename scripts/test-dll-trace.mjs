/* Regression: doubly linked list live trace (q125-style stack nodes + Node **). */
import { traceC } from "../js/ctracer.js";
import { preprocessVizSource } from "../js/viz-preprocess.js";

const code = `
#include <stddef.h>
#include <stdio.h>

typedef struct Node {
    int value;
    struct Node *prev;
    struct Node *next;
} Node;

void appendNode(Node **head, Node **tail, Node *node) {
    node->prev = *tail;
    node->next = NULL;
    if (*tail != NULL) {
        (*tail)->next = node;
    } else {
        *head = node;
    }
    *tail = node;
}

void removeFirstN(Node **head, size_t n) {
    while (*head != NULL && n > 0) {
        Node *removed = *head;
        *head = removed->next;
        if (*head != NULL) {
            (*head)->prev = NULL;
        }
        removed->prev = NULL;
        removed->next = NULL;
        --n;
    }
}

int main(void) {
    Node n10 = {10, NULL, NULL};
    Node n20 = {20, NULL, NULL};
    Node n30 = {30, NULL, NULL};
    Node *head = NULL;
    Node *tail = NULL;
    appendNode(&head, &tail, &n10);
    appendNode(&head, &tail, &n20);
    appendNode(&head, &tail, &n30);
    removeFirstN(&head, 1);
    printf("head=%d\\n", head ? head->value : -1);
    return 0;
}
`;

const { source, structDefs } = preprocessVizSource(code);
const trace = traceC(code, { vizStructs: true, structDefs, preprocessedSource: source, maxSteps: 3000 });
console.log("steps:", trace.steps.length);
console.log("output:", trace.output.trim());
console.log("heap nodes:", trace.steps.at(-2)?.heap?.length ?? 0);
const lastHeap = trace.steps.at(-2)?.heap ?? [];
const live = lastHeap.filter((n) => n.fields.next?.stIdx !== null || n.fields.prev?.stIdx !== null || n.fields.value?.val === 30);
console.log("live head value:", lastHeap.find((n) => n.fields.prev?.stIdx === null && n.fields.value)?.fields.value?.val);
