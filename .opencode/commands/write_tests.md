---
description: Write tests for frontend code.
agent: 
model: 
---
This command generates tests for frontend code, following best practices and conventions. It uses Vitests with React Testing Library, placing test files in a __tests__ directory alongside the source files. Test files are named [filename].test.ts(x) and use @/ prefix for imports.

When writing tests, cover:
- Happy paths: Ensure the component or function works as expected under normal conditions.
- Edge cases: Test unusual or extreme inputs to verify the component handles them gracefully.
- Error states: Simulate errors or invalid inputs to confirm the component responds appropriately, such as displaying error messages or preventing crashes.

By adhering to these conventions and coverage guidelines, you can create robust tests that improve the reliability and maintainability of your frontend code.   

Testing conventions:
* Use Vitests with React Testing Library
* Place test files in a __tests__ directory in the same folder as the source file
* Name test files as [filename].test.ts(x)
* Use @/ prefix for imports

Coverage:
* Test happy paths
* Test edge cases
* Test error states