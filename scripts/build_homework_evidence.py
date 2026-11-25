"""Build the visible homework ledger from the checked original-source audit.

Usage: python scripts/build_homework_evidence.py /path/to/source-audit.json
The audit retains original instructions; this view uses concise learner-facing copy.
"""
import json
import sys
from pathlib import Path

audit = json.loads(Path(sys.argv[1]).read_text())
result = {f"L{i}": {"book": [], "handouts": [], "reference": []} for i in range(1, 9)}
short = {
    "hw-01": "Match greetings to times of day and formal or informal situations.",
    "hw-02": "Match the dialogues to the pictures.",
    "hw-03": "Choose the correct forms of essere and chiamarsi.",
    "hw-04": "Fill the gaps with the supplied words.",
    "hw-05": "Match each word to its article.",
    "hw-06": "Complete the sentences with the correct expressions.",
    "hw-07": "Match the questions to their answers.",
    "hw-08": "Join the syllables to make Italian country names.",
    "hw-09": "Put the dialogue in order.",
    "hw-10": "Complete the sentences with the correct words.",
    "hw-11": "Follow the number maze from 20 down to 0. Read the hidden sentence.",
    "hw-12": "A: Listen, repeat and match the pictures. B: Ask how someone is, using tu and Lei. C: Order the replies from most positive to most negative.",
    "hw-13": "Listen to each dialogue. Decide whether it uses informal tu or formal Lei.",
    "hw-14": "Choose the number for each family member's age.",
    "hw-15": "A: Complete the numbers. B: Listen and check.",
    "hw-16": "Tick the numbers you hear.",
    "hw-17": "Look at the picture. Read and answer the questions.",
    "hw-18": "Listen and add a question mark or full stop. Listen again and repeat the intonation.",
    "hw-19": "Fill the gaps with the correct verb.",
    "hw-20": "Use the pictures to complete the job titles.",
    "hw-21": "Write the workplace for each job.",
    "hw-22": "Complete the sentences with the missing words.",
}

def source(entry):
    value = entry["source"]
    filename = " ".join(Path(value["path"]).name.split())
    locator = f"p. {value['number']}" if value["unit"] == "page" else "Homework section"
    return {"file": filename, "locator": locator, "sourceId": value["source_id"]}

for row in audit["homework_book_references"]:
    pages = row["printed_book_pages"]
    label = ("p. " if len(pages) == 1 else "pp. ") + " and ".join(map(str, pages))
    result[f"L{row['lesson']}"]["book"].append({
        "id": row["id"], "label": label + ", exercise " + row["exercise"],
        "task": short[row["id"]], "source": source(row),
        "pageCopyChecked": row["copy_supplied"] is not None,
    })

handouts = [
    ("spell-name", "Spell your full name", "Say it, write it, or practise both.", [("class2-alphabet", "Alphabet practice")]),
    ("c-g-homework", "C/CH and G/GH worksheets", "Put each word in the correct sound column.", [("class2-homework-c-columns", "C and CH"), ("class2-homework-g-columns", "G and GH")]),
    ("avere-homework", "Avere homework: exercises 1, 2 and 3", "Complete the verb forms, choose H or no H, then complete ages with forms and numbers.", [("class4-avere-homework", "Avere forms"), ("class4-silent-h", "H or no H"), ("class4-ages-homework", "Ages")]),
    ("plural-homework", "Singular/plural worksheet: A, B, C and D", "Change singular to plural, fill plural articles, change plural to singular, then correct the mistakes.", [("class5-plurals-a", "A: Make it plural"), ("class5-plurals-b", "B: Choose the article"), ("class5-plurals-c", "C: Make it singular"), ("class5-plurals-d", "D: Correct the mistake")]),
    ("essere-homework", "Essere homework and negative sentences", "Match pronouns and forms, fill the gaps, choose translations, then practise non with essere.", [("l6-essere-matching", "Match forms"), ("l6-essere-gaps", "Fill gaps"), ("l6-essere-translation", "Translations"), ("l6-negative-homework", "Negative sentences")]),
    ("are-homework", "Regular -ARE worksheet: all five activities", "Match meanings, fill gaps, choose forms, fill more gaps, then translate sentences.", [("l7-homework-matching", "1: Meanings"), ("l7-homework-gaps", "2: Gaps"), ("l7-homework-choices", "3: Choices"), ("l7-homework-more", "4: More gaps"), ("l7-homework-translation", "5: Translations")]),
    ("fare-stare-homework", "Fare and stare worksheet: all six activities", "Match jobs and meanings, match workplaces, complete both verb tables, fill fare gaps, then match expressions.", [("l8-verb-tables", "Verb tables"), ("l8-verb-choices", "Fare gaps"), ("l8-jobs-workplaces", "Jobs and workplaces"), ("l8-wellbeing", "Expressions")]),
]
assert len(handouts) == len(audit["homework_handout_assignments"])
for row, (key, label, task, links) in zip(audit["homework_handout_assignments"], handouts):
    result[f"L{row['lesson']}"]["handouts"].append({
        "id": key, "label": label, "task": task, "source": source(row),
        "links": [{"set": key, "label": title} for key, title in links],
    })

# Only references explicitly offered for additional study, not class activities.
for row in audit["book_class_and_reference_material"]:
    if (row["lesson"], row["pages"]) not in [(2, [224]), (5, [126, 127]), (7, [233])]:
        continue
    label = ("p. " if len(row["pages"]) == 1 else "pp. ") + " and ".join(map(str, row["pages"]))
    result[f"L{row['lesson']}"]["reference"].append({"label": label, "task": row["purpose"], "source": source(row)})

out = Path(__file__).resolve().parents[1] / "study/homework-evidence.js"
out.write_text("/* Checked against Laura's original minutes. See docs/SEMESTER_1_SOURCE_AUDIT.md. */\n"
               "(function(root){'use strict';\nconst lessons = " + json.dumps(result, ensure_ascii=False, indent=2) +
               ";\nif(typeof module!=='undefined')module.exports=lessons;\nif(root)root.ItalianHomeworkEvidence=lessons;\n})(typeof window!=='undefined'?window:null);\n")
print(f"Wrote {out.name}: 22 book assignments, 7 handout/oral groups, 3 further-reading references.")
