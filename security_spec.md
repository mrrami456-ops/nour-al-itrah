# Security Specification for Noor Al-Itrah (`martyrs` Collection)

## 1. Data Invariants
1. Every document in `/martyrs/{martyrId}` must have a valid alphanumeric/hyphen/underscore document ID (`<= 128` chars).
2. Every document must strictly contain only the allowed keys: `['name', 'deathDate', 'photoUrl', 'bio', 'fatihaCount', 'isVisible', 'createdAt', 'updatedAt']`.
3. `name` is a non-empty string between 2 and 120 characters.
4. `deathDate` is a non-empty string between 2 and 80 characters.
5. `photoUrl` is a string up to 600 characters (can be empty `""` for the default symbolic avatar).
6. `bio` is a string up to 240 characters.
7. `fatihaCount` is a non-negative integer (`>= 0`).
8. `isVisible` is a boolean (`true` for active records).
9. `createdAt` and `updatedAt` are server timestamps (`request.time`), and `createdAt` is immutable on update.
10. List queries (`allow list`) must evaluate `resource.data.isVisible == true` so only visible memorial cards are returned.

## 2. The "Dirty Dozen" Payloads
1. **Ghost Field Injection**: Adding `{"isAdmin": true}` to a martyr document -> Rejected by `.hasOnly(...)`.
2. **Oversized Name**: `name` with 5000 characters -> Rejected by `data.name.size() <= 120`.
3. **Empty Name**: `name: ""` -> Rejected by `data.name.size() >= 2`.
4. **Oversized Photo URL**: `photoUrl` with 2000 characters -> Rejected by `data.photoUrl.size() <= 600`.
5. **Negative Fatiha Count**: `fatihaCount: -10` -> Rejected by `data.fatihaCount >= 0`.
6. **Non-Integer Fatiha Count**: `fatihaCount: "100"` -> Rejected by `data.fatihaCount is int`.
7. **Forged Creation Timestamp**: `createdAt` set to a past or future timestamp instead of `request.time` -> Rejected by `incoming().createdAt == request.time`.
8. **Mutating Immutable `createdAt` on Update**: Changing `createdAt` during an update -> Rejected by `incoming().createdAt == existing().createdAt`.
9. **ID Poisoning**: Document ID containing spaces or >128 chars -> Rejected by `isValidId(martyrId)`.
10. **Missing Required Field**: Omitting `deathDate` on create -> Rejected by `.hasAll(...)`.
11. **Type Poisoning on Update**: Updating `bio` to an array or boolean -> Rejected by `isValidMartyrRecord(incoming())`.
12. **Unbounded Fatiha Jump by Non-Admin Action**: Incrementing `fatihaCount` without updating `updatedAt == request.time` -> Rejected by temporal integrity check.
