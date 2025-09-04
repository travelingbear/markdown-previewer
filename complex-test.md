# Complex Markdown Test File

This file tests advanced features of the Markdown Previewer extension.

## Remote Images

### Static Images
![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

![Unsplash Photo](https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop)

### Animated GIFs
![Loading GIF](https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif)

![Cat GIF](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)

![Typing GIF](https://media.giphy.com/media/13GIgrGdslD9oQ/giphy.gif)

## Complex Mermaid Diagrams

### Flowchart with Decision Points
```mermaid
flowchart TD
    A[Start] --> B{Is user logged in?}
    B -->|Yes| C[Show Dashboard]
    B -->|No| D[Show Login Form]
    D --> E[User enters credentials]
    E --> F{Valid credentials?}
    F -->|Yes| G[Create session]
    F -->|No| H[Show error message]
    H --> D
    G --> C
    C --> I[User performs actions]
    I --> J{User wants to logout?}
    J -->|Yes| K[Destroy session]
    J -->|No| I
    K --> L[Redirect to home]
    L --> M[End]
```

### Sequence Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant S as Server
    participant DB as Database
    participant API as External API
    
    U->>B: Enter URL
    B->>S: HTTP Request
    S->>DB: Query user data
    DB-->>S: Return user data
    S->>API: Fetch additional info
    API-->>S: Return API response
    S-->>B: HTML Response
    B-->>U: Render page
    
    Note over U,API: Authentication flow
    U->>B: Click login
    B->>S: POST credentials
    S->>DB: Validate user
    DB-->>S: User valid
    S-->>B: Set cookie
    B-->>U: Redirect to dashboard
```

### Class Diagram
```mermaid
classDiagram
    class User {
        +String name
        +String email
        +Date createdAt
        +login()
        +logout()
        +updateProfile()
    }
    
    class Post {
        +String title
        +String content
        +Date publishedAt
        +User author
        +publish()
        +edit()
        +delete()
    }
    
    class Comment {
        +String content
        +Date createdAt
        +User author
        +Post post
        +reply()
        +edit()
    }
    
    User ||--o{ Post : creates
    User ||--o{ Comment : writes
    Post ||--o{ Comment : has
```

### Gantt Chart
```mermaid
gantt
    title Project Development Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements Analysis    :done, req, 2024-01-01, 2024-01-15
    System Design          :done, design, after req, 20d
    
    section Development
    Backend Development     :active, backend, 2024-02-01, 45d
    Frontend Development    :frontend, after design, 40d
    Database Setup         :db, 2024-02-01, 15d
    
    section Testing
    Unit Testing           :testing, after backend, 20d
    Integration Testing    :int-test, after frontend, 15d
    User Acceptance Testing :uat, after int-test, 10d
    
    section Deployment
    Production Setup       :prod, after uat, 5d
    Go Live               :milestone, golive, after prod, 1d
```

### Git Graph
```mermaid
gitgraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add user authentication"
    commit id: "Implement dashboard"
    branch feature/posts
    checkout feature/posts
    commit id: "Create post model"
    commit id: "Add post CRUD operations"
    checkout develop
    merge feature/posts
    commit id: "Add post validation"
    checkout main
    merge develop
    commit id: "Release v1.0"
    checkout develop
    commit id: "Add comment system"
    branch hotfix/security
    checkout hotfix/security
    commit id: "Fix security vulnerability"
    checkout main
    merge hotfix/security
    commit id: "Release v1.0.1"
```

### State Diagram
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : start_request
    Loading --> Success : request_complete
    Loading --> Error : request_failed
    Success --> Idle : reset
    Error --> Idle : reset
    Error --> Loading : retry
    
    state Loading {
        [*] --> Fetching
        Fetching --> Processing : data_received
        Processing --> [*] : processing_complete
    }
    
    state Error {
        [*] --> NetworkError
        [*] --> ValidationError
        [*] --> ServerError
        NetworkError --> [*]
        ValidationError --> [*]
        ServerError --> [*]
    }
```

## Interactive Elements

### Checkboxes
- [ ] Test checkbox functionality
- [x] Verify checkbox state updates
- [ ] Check if source markdown updates
- [x] Confirm bidirectional sync
- [ ] Test with nested lists
  - [ ] Nested checkbox 1
  - [x] Nested checkbox 2
  - [ ] Nested checkbox 3

### Code Blocks

#### JavaScript
```javascript
class MarkdownPreviewer {
    constructor(theme = 'light') {
        this.theme = theme;
        this.isPreviewMode = true;
    }
    
    toggleMode() {
        this.isPreviewMode = !this.isPreviewMode;
        this.render();
    }
    
    async loadRemoteImage(url) {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            console.error('Failed to load image:', error);
            return false;
        }
    }
}
```

#### Python
```python
import asyncio
import aiohttp
from typing import Optional

class MermaidRenderer:
    def __init__(self, theme: str = 'default'):
        self.theme = theme
        self.cache = {}
    
    async def render_diagram(self, diagram_code: str) -> Optional[str]:
        """Render mermaid diagram to SVG"""
        if diagram_code in self.cache:
            return self.cache[diagram_code]
        
        async with aiohttp.ClientSession() as session:
            payload = {
                'code': diagram_code,
                'theme': self.theme
            }
            async with session.post('/render', json=payload) as response:
                if response.status == 200:
                    svg_content = await response.text()
                    self.cache[diagram_code] = svg_content
                    return svg_content
        return None
```

## Tables

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Mermaid Diagrams | ✅ Complete | High | All diagram types supported |
| Remote Images | ✅ Complete | High | PNG, JPG, GIF, SVG |
| Animated GIFs | ✅ Complete | Medium | Full animation support |
| Theme Switching | ✅ Complete | Medium | Light/Dark themes |
| Position Sync | ✅ Complete | Low | Bidirectional scrolling |

## Quotes and Links

> "The best way to test software is to use it in real scenarios with complex data."
> 
> — Software Testing Principles

Check out these resources:
- [Mermaid.js Documentation](https://mermaid-js.github.io/mermaid/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [VSCode Extension API](https://code.visualstudio.com/api)

---

**Test Instructions:**
1. Toggle between preview and code mode using Alt+M
2. Click checkboxes in preview mode
3. Verify all images and GIFs load properly
4. Check that all Mermaid diagrams render correctly
5. Test theme switching (right-click in preview)
6. Verify position sync when scrolling