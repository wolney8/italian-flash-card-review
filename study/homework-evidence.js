/* Checked against Laura's original minutes. See docs/SEMESTER_1_SOURCE_AUDIT.md. */
(function(root){'use strict';
const lessons = {
  "L1": {
    "book": [
      {
        "id": "hw-01",
        "label": "pp. 164 and 165, exercise 1",
        "task": "Match greetings to times of day and formal or informal situations.",
        "source": {
          "file": "Italian Session 1 - 22.09.26 Date(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-14"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-02",
        "label": "pp. 164 and 165, exercise 2",
        "task": "Match the dialogues to the pictures.",
        "source": {
          "file": "Italian Session 1 - 22.09.26 Date(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-14"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-03",
        "label": "pp. 164 and 165, exercise 3",
        "task": "Choose the correct forms of essere and chiamarsi.",
        "source": {
          "file": "Italian Session 1 - 22.09.26 Date(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-14"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-04",
        "label": "pp. 164 and 165, exercise 4",
        "task": "Fill the gaps with the supplied words.",
        "source": {
          "file": "Italian Session 1 - 22.09.26 Date(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-14"
        },
        "pageCopyChecked": false
      }
    ],
    "handouts": [],
    "reference": []
  },
  "L2": {
    "book": [
      {
        "id": "hw-05",
        "label": "p. 172, exercise 9",
        "task": "Match each word to its article.",
        "source": {
          "file": "Session 2 - 29.09.2026 Date.docx",
          "locator": "Homework section",
          "sourceId": "src-16"
        },
        "pageCopyChecked": true
      }
    ],
    "handouts": [
      {
        "id": "spell-name",
        "label": "Spell your full name",
        "task": "Say it, write it, or practise both.",
        "source": {
          "file": "Session 2 - 29.09.2026 Date.docx",
          "locator": "Homework section",
          "sourceId": "src-16"
        },
        "links": [
          {
            "set": "class2-alphabet",
            "label": "Alphabet practice"
          }
        ]
      },
      {
        "id": "c-g-homework",
        "label": "C/CH and G/GH worksheets",
        "task": "Put each word in the correct sound column.",
        "source": {
          "file": "Session 2 - 29.09.2026 Date.docx",
          "locator": "Homework section",
          "sourceId": "src-16"
        },
        "links": [
          {
            "set": "class2-homework-c-columns",
            "label": "C and CH"
          },
          {
            "set": "class2-homework-g-columns",
            "label": "G and GH"
          }
        ]
      }
    ],
    "reference": [
      {
        "label": "p. 224",
        "task": "Reference recap of C/CH and G/GH.",
        "source": {
          "file": "Session 2 - 29.09.2026 Date.docx",
          "locator": "Homework section",
          "sourceId": "src-16"
        }
      }
    ]
  },
  "L3": {
    "book": [
      {
        "id": "hw-06",
        "label": "p. 164, exercise 6",
        "task": "Complete the sentences with the correct expressions.",
        "source": {
          "file": "Session 3 - 06.10.2026(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-17"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-07",
        "label": "p. 165, exercise 7",
        "task": "Match the questions to their answers.",
        "source": {
          "file": "Session 3 - 06.10.2026(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-17"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-08",
        "label": "p. 165, exercise 8",
        "task": "Join the syllables to make Italian country names.",
        "source": {
          "file": "Session 3 - 06.10.2026(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-17"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-09",
        "label": "p. 165, exercise 9",
        "task": "Put the dialogue in order.",
        "source": {
          "file": "Session 3 - 06.10.2026(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-17"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-10",
        "label": "p. 165, exercise 10",
        "task": "Complete the sentences with the correct words.",
        "source": {
          "file": "Session 3 - 06.10.2026(1).pdf",
          "locator": "p. 3",
          "sourceId": "src-17"
        },
        "pageCopyChecked": false
      }
    ],
    "handouts": [],
    "reference": []
  },
  "L4": {
    "book": [
      {
        "id": "hw-11",
        "label": "p. 166, exercise 12",
        "task": "Follow the number maze from 20 down to 0. Read the hidden sentence.",
        "source": {
          "file": "Session 4 - 13.10.2026(1).pdf",
          "locator": "p. 5",
          "sourceId": "src-19"
        },
        "pageCopyChecked": true
      }
    ],
    "handouts": [
      {
        "id": "avere-homework",
        "label": "Avere homework: exercises 1, 2 and 3",
        "task": "Complete the verb forms, choose H or no H, then complete ages with forms and numbers.",
        "source": {
          "file": "Session 4 - 13.10.2026(1).pdf",
          "locator": "p. 5",
          "sourceId": "src-19"
        },
        "links": [
          {
            "set": "class4-avere-homework",
            "label": "Avere forms"
          },
          {
            "set": "class4-silent-h",
            "label": "H or no H"
          },
          {
            "set": "class4-ages-homework",
            "label": "Ages"
          }
        ]
      }
    ],
    "reference": []
  },
  "L5": {
    "book": [
      {
        "id": "hw-12",
        "label": "p. 22, exercise 6 A, B, C",
        "task": "A: Listen, repeat and match the pictures. B: Ask how someone is, using tu and Lei. C: Order the replies from most positive to most negative.",
        "source": {
          "file": "Session 5 - 20.10.2026.pdf",
          "locator": "p. 1",
          "sourceId": "src-22"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-13",
        "label": "p. 12, exercise 10",
        "task": "Listen to each dialogue. Decide whether it uses informal tu or formal Lei.",
        "source": {
          "file": "Session 5 - 20.10.2026.pdf",
          "locator": "p. 2",
          "sourceId": "src-22"
        },
        "pageCopyChecked": false
      }
    ],
    "handouts": [
      {
        "id": "plural-homework",
        "label": "Singular/plural worksheet: A, B, C and D",
        "task": "Change singular to plural, fill plural articles, change plural to singular, then correct the mistakes.",
        "source": {
          "file": "Session 5 - 20.10.2026.pdf",
          "locator": "p. 2",
          "sourceId": "src-22"
        },
        "links": [
          {
            "set": "class5-plurals-a",
            "label": "A: Make it plural"
          },
          {
            "set": "class5-plurals-b",
            "label": "B: Choose the article"
          },
          {
            "set": "class5-plurals-c",
            "label": "C: Make it singular"
          },
          {
            "set": "class5-plurals-d",
            "label": "D: Correct the mistake"
          }
        ]
      }
    ],
    "reference": [
      {
        "label": "pp. 126 and 127",
        "task": "Grammar reference: plural formation and definite/indefinite articles.",
        "source": {
          "file": "Session 5 - 20.10.2026.pdf",
          "locator": "p. 1",
          "sourceId": "src-22"
        }
      }
    ]
  },
  "L6": {
    "book": [
      {
        "id": "hw-14",
        "label": "p. 20, exercise 1",
        "task": "Choose the number for each family member's age.",
        "source": {
          "file": "Session 6 - 03.11.2026 - Minutes.pdf",
          "locator": "p. 5",
          "sourceId": "src-24"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-15",
        "label": "p. 20, exercise 2 (A and B)",
        "task": "A: Complete the numbers. B: Listen and check.",
        "source": {
          "file": "Session 6 - 03.11.2026 - Minutes.pdf",
          "locator": "p. 5",
          "sourceId": "src-24"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-16",
        "label": "p. 21, exercise 3",
        "task": "Tick the numbers you hear.",
        "source": {
          "file": "Session 6 - 03.11.2026 - Minutes.pdf",
          "locator": "p. 5",
          "sourceId": "src-24"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-17",
        "label": "p. 21, exercise 4 (A)",
        "task": "Look at the picture. Read and answer the questions.",
        "source": {
          "file": "Session 6 - 03.11.2026 - Minutes.pdf",
          "locator": "p. 5",
          "sourceId": "src-24"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-18",
        "label": "p. 175, exercise 19",
        "task": "Listen and add a question mark or full stop. Listen again and repeat the intonation.",
        "source": {
          "file": "Session 6 - 03.11.2026 - Minutes.pdf",
          "locator": "p. 5",
          "sourceId": "src-24"
        },
        "pageCopyChecked": false
      }
    ],
    "handouts": [
      {
        "id": "essere-homework",
        "label": "Essere homework and negative sentences",
        "task": "Match pronouns and forms, fill the gaps, choose translations, then practise non with essere.",
        "source": {
          "file": "Session 6 - 03.11.2026 - Minutes.pdf",
          "locator": "p. 5",
          "sourceId": "src-24"
        },
        "links": [
          {
            "set": "l6-essere-matching",
            "label": "Match forms"
          },
          {
            "set": "l6-essere-gaps",
            "label": "Fill gaps"
          },
          {
            "set": "l6-essere-translation",
            "label": "Translations"
          },
          {
            "set": "l6-negative-homework",
            "label": "Negative sentences"
          }
        ]
      }
    ],
    "reference": []
  },
  "L7": {
    "book": [
      {
        "id": "hw-19",
        "label": "p. 173, exercise 14",
        "task": "Fill the gaps with the correct verb.",
        "source": {
          "file": "Session 7 - 10.11.2026 - Minutes.pdf",
          "locator": "p. 4",
          "sourceId": "src-27"
        },
        "pageCopyChecked": false
      }
    ],
    "handouts": [
      {
        "id": "are-homework",
        "label": "Regular -ARE worksheet: all five activities",
        "task": "Match meanings, fill gaps, choose forms, fill more gaps, then translate sentences.",
        "source": {
          "file": "Session 7 - 10.11.2026 - Minutes.pdf",
          "locator": "p. 4",
          "sourceId": "src-27"
        },
        "links": [
          {
            "set": "l7-homework-matching",
            "label": "1: Meanings"
          },
          {
            "set": "l7-homework-gaps",
            "label": "2: Gaps"
          },
          {
            "set": "l7-homework-choices",
            "label": "3: Choices"
          },
          {
            "set": "l7-homework-more",
            "label": "4: More gaps"
          },
          {
            "set": "l7-homework-translation",
            "label": "5: Translations"
          }
        ]
      }
    ],
    "reference": [
      {
        "label": "p. 233",
        "task": "Further verb grammar.",
        "source": {
          "file": "Session 7 - 10.11.2026 - Minutes.pdf",
          "locator": "p. 2",
          "sourceId": "src-27"
        }
      }
    ]
  },
  "L8": {
    "book": [
      {
        "id": "hw-20",
        "label": "p. 26, exercise 14",
        "task": "Use the pictures to complete the job titles.",
        "source": {
          "file": "Session 8 - 17.11.2026 - Minutes.pdf",
          "locator": "p. 6",
          "sourceId": "src-30"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-21",
        "label": "p. 173, exercise 12",
        "task": "Write the workplace for each job.",
        "source": {
          "file": "Session 8 - 17.11.2026 - Minutes.pdf",
          "locator": "p. 6",
          "sourceId": "src-30"
        },
        "pageCopyChecked": false
      },
      {
        "id": "hw-22",
        "label": "p. 174, exercise 15",
        "task": "Complete the sentences with the missing words.",
        "source": {
          "file": "Session 8 - 17.11.2026 - Minutes.pdf",
          "locator": "p. 6",
          "sourceId": "src-30"
        },
        "pageCopyChecked": false
      }
    ],
    "handouts": [
      {
        "id": "fare-stare-homework",
        "label": "Fare and stare worksheet: all six activities",
        "task": "Match jobs and meanings, match workplaces, complete both verb tables, fill fare gaps, then match expressions.",
        "source": {
          "file": "Session 8 - 17.11.2026 - Minutes.pdf",
          "locator": "p. 6",
          "sourceId": "src-30"
        },
        "links": [
          {
            "set": "l8-verb-tables",
            "label": "Verb tables"
          },
          {
            "set": "l8-verb-choices",
            "label": "Fare gaps"
          },
          {
            "set": "l8-jobs-workplaces",
            "label": "Jobs and workplaces"
          },
          {
            "set": "l8-wellbeing",
            "label": "Expressions"
          }
        ]
      }
    ],
    "reference": []
  }
};
if(typeof module!=='undefined')module.exports=lessons;
if(root)root.ItalianHomeworkEvidence=lessons;
})(typeof window!=='undefined'?window:null);
