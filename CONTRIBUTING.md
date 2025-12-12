# Contributing to GitTrunfo P2P

Thank you for your interest in contributing to GitTrunfo P2P! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features or improvements
- 📝 Improve documentation
- 🎨 Design new themes
- 🔧 Fix issues
- ✨ Add new features
- 🧪 Write tests

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Git
- A GitHub account

### Setup Development Environment

1. **Fork the repository**
   - Click the "Fork" button at the top right of the repository page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gitTrunfoPVP.git
   cd gitTrunfoPVP
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/bmsrk/gitTrunfoPVP.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build the project**
   ```bash
   npm run build
   ```

## 📋 Contribution Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `style/` - Code style/formatting
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Keep changes focused and atomic
- Test your changes thoroughly

### 3. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add tournament bracket UI"
```

**Commit message format:**
```
<type>: <description>

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then go to GitHub and create a Pull Request from your branch.

## 📝 Pull Request Guidelines

### PR Title

Use a clear, descriptive title:
- ✅ "feat: add deck selection UI"
- ✅ "fix: resolve P2P connection timeout"
- ❌ "updates"
- ❌ "fixed stuff"

### PR Description

Include:
- **What**: What changes does this PR introduce?
- **Why**: Why are these changes needed?
- **How**: How were the changes implemented?
- **Testing**: How was this tested?
- **Screenshots**: If UI changes, include before/after screenshots

### Example PR Template

```markdown
## Description
Add deck selection feature allowing players to choose between different technology stacks.

## Changes
- Added 4 deck types: Standard, Web, LegacyLanguages, Esoteric
- Created deck selection UI screen
- Updated game initialization to use selected deck

## Testing
- [x] Single player mode works with all decks
- [x] Multiplayer mode shares deck selection
- [x] UI is responsive on mobile
- [x] Build succeeds

## Screenshots
![Deck Selection](url-to-screenshot)
```

## 🎨 Code Style Guidelines

### TypeScript/React

- Use functional components with hooks
- Use TypeScript for type safety
- Follow existing naming conventions
- Keep components focused and small
- Add comments for complex logic

### Example Component

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <button onClick={onAction} className="btn-primary">
      {title}
    </button>
  );
};

export default MyComponent;
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the theme system variables
- Ensure responsive design (mobile-first)
- Test on multiple screen sizes

### File Organization

```
gitTrunfoPVP/
├── components/       # React components
├── services/         # Business logic and API services
├── types.ts         # TypeScript type definitions
├── App.tsx          # Main application component
└── index.tsx        # Entry point
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Single player mode works
- [ ] Multiplayer host works
- [ ] Multiplayer client connection works
- [ ] Deck selection functions properly
- [ ] All themes display correctly
- [ ] Mobile responsive design
- [ ] Build succeeds without errors
- [ ] No console errors

### Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest, if possible)

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Try to reproduce on latest version
3. Gather relevant information

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Game Mode: Single Player
- Deck: Web Technologies

## Screenshots
[If applicable]

## Additional Context
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem it Solves
What problem does this address?

## Proposed Solution
How would this work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Mockups, examples, etc.
```

## 🎯 Areas for Contribution

### High Priority

- Tournament bracket system implementation
- Persistent statistics/leaderboards
- Custom deck creation
- Accessibility improvements (ARIA labels, keyboard nav)
- Sound toggle preference
- Automated tests

### Medium Priority

- Additional deck types
- More retro themes
- Animation improvements
- Performance optimizations
- GitHub OAuth integration

### Good First Issues

Look for issues labeled `good first issue` in the repository.

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PeerJS Documentation](https://peerjs.com/docs/)
- [GitHub API](https://docs.github.com/en/rest)

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct
- Ask questions when unsure

## 📞 Getting Help

- Open an issue for questions
- Check existing issues and PRs
- Read the documentation (ARCHITECTURE.md, GAMEPLAY.md)

## 🎉 Recognition

Contributors will be:
- Listed in the project contributors
- Mentioned in release notes (for significant contributions)
- Part of building an awesome open source game!

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

**Thank you for contributing to GitTrunfo P2P! 🚀**
