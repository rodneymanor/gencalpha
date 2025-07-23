# Editor Guide & Reference

## Overview
This document contains comprehensive guides for using the various editors in the Gen C Alpha application, including keyboard shortcuts, slash commands, and best practices.

## Script Editor (Production Ready) 🚀

### Keyboard Shortcuts
- **Ctrl/Cmd + B** - Bold formatting (`**text**`)
- **Ctrl/Cmd + I** - Italic formatting (`*text*`)
- **Ctrl/Cmd + Enter** - Insert line break (`\n\n`)

### Features
- Auto-resizing textarea
- Character counter
- Real-time formatting shortcuts
- Plain text output (perfect for AI processing)
- Zero console errors and maximum reliability

### Best Practices
- Use for final script writing and AI integration
- Perfect for long-form content creation
- Ideal when you need reliable, error-free editing
- Output format works seamlessly with AI services

---

## Custom Block Editor (Phase 5) 🎨

### Slash Commands
Type `/` followed by the block type to insert custom script blocks:

#### Available Blocks

**Hook Block** 🪝
- **Command**: `/hook`
- **Purpose**: Attention-grabbing opening statements
- **Visual**: Orange theme with Zap icon
- **Usage**: Use at the beginning of scripts to capture audience attention

**Bridge Block** 🌉  
- **Command**: `/bridge`
- **Purpose**: Transition statements connecting different sections
- **Visual**: Cyan theme with Arrow Right icon
- **Usage**: Link ideas, topics, or sections smoothly

**Golden Nugget Block** 💡
- **Command**: `/golden-nugget` or `/nugget`
- **Purpose**: Key insights, important takeaways, or valuable information
- **Visual**: Blue theme with Lightbulb icon
- **Usage**: Highlight the most important points in your script

**Call-to-Action Block** 🎯
- **Command**: `/cta`
- **Purpose**: Direct audience actions, requests, or next steps
- **Visual**: Green theme with Target icon
- **Usage**: End sections or scripts with clear action items

### Block Features
- **Visual Styling**: Each block has distinctive color-coding and icons
- **Inline Content**: All blocks support rich text editing within them
- **Easy Access**: Type `/` to see all available custom blocks
- **Script-Focused**: Designed specifically for video script writing workflow

### Best Practices
- Use Hook blocks for strong openings
- Bridge blocks help maintain flow between topics
- Golden Nugget blocks for key takeaways
- CTA blocks for clear next steps
- Combine blocks to create structured, engaging scripts

---

## BlockNote Editors (Legacy)

### Minimal BlockNote Editor ⚡
- Basic BlockNote implementation
- Supports standard blocks (paragraph, heading)
- May experience ProseMirror position errors
- JSON output format

### Stable BlockNote Editor 🏆
- Enhanced error handling and initialization
- Debounced updates for better performance
- Disabled input/paste rules to prevent errors
- Still may have occasional position issues

### Simple BlockNote Editor 🧪
- Testing implementation with fallback to textarea
- Toggle between BlockNote and simple textarea
- Good for experimenting with BlockNote features
- Error reporting and recovery

---

## General Editor Tips

### Content Format
- **Script Editor**: Plain text output (ideal for AI)
- **Custom Block Editor**: JSON structure with custom block data
- **BlockNote Editors**: Standard BlockNote JSON format

### Performance
- Script Editor: Fastest, most reliable
- Custom Block Editor: Good performance with rich features
- BlockNote Editors: May have performance issues with complex content

### Use Cases
- **Script Writing + AI**: Use Script Editor
- **Structured Content**: Use Custom Block Editor
- **Experimentation**: Use BlockNote editors for testing

---

## Troubleshooting

### Common Issues
1. **ProseMirror Position Errors**: Switch to Script Editor for reliability
2. **Slow Performance**: Reduce content complexity or use Script Editor
3. **Content Loss**: All editors preserve content when switching between them
4. **Import/Export**: Use JSON format for BlockNote editors, plain text for Script Editor

### Error Recovery
- All editors have retry mechanisms
- Content is preserved during editor switches
- Test page allows easy comparison between editors

---

## Integration Notes

### AI Services
- Script Editor output is immediately ready for AI processing
- Custom Block Editor JSON can be parsed for AI analysis
- Plain text format recommended for most AI workflows

### Export Options
- Plain text: Direct copy from Script Editor
- Structured data: Export JSON from Custom Block Editor
- Mixed format: Use appropriate editor based on end goal

---

## Development Notes

### Adding New Custom Blocks
1. Define block in `script-blocks.tsx`
2. Add to schema in `custom-schema.tsx`
3. Update documentation here
4. Test in Custom Block Editor

### Editor Extensions
- All editors are modular and extensible
- Custom blocks can be added without affecting core functionality
- Script Editor can be enhanced with additional formatting options

---

*Last Updated: Phase 5 Implementation*
*This guide covers all current editor implementations and their capabilities.*