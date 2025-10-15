# Models & ER Diagram

## User
Default Django User Model (username, email, password)

## Resume
| Field | Type | Description |
|--------|------|-------------|
| user | FK(User) | Owner |
| file | FileField | Resume file |
| parsed_text | TextField | Extracted text |
| uploaded_at | DateTime | Upload timestamp |
| updated_at | DateTime | Last modified |
| file_size | Integer | KB size |

## JobDescription
| Field | Type | Description |
|--------|------|-------------|
| title | CharField | Job title |
| company | CharField | Company name |
| description | TextField | Job details |
| skills_required | TextField | Skills |

## SkillGapAnalysis (Planned)
| Field | Type | Description |
|--------|------|-------------|
| resume | FK(Resume) | Linked resume |
| job | FK(JobDescription) | Linked job |
| matched_skills | Array/Text | Common skills |
| missing_skills | Array/Text | Skills to learn |
| match_score | Float | % similarity |

## ER Diagram
```text
+-----------+      +---------+       +--------------+
|   User    |------| Resume  |       | JobDesc      |
+-----------+      +---------+       +--------------+
       |                |                     |
       |                +-- SkillGapAnalysis--+
```