# Campus Bites project structure

This structure is based on the uploaded repository. Existing backend paths are deliberately preserved so current relative paths, the Express static-file serving, and the C++ bridge continue to work.

```text
PBL-SEM-3-DSA-AND-OOPS/
├── backend/
│   ├── server.js                 # Existing Express server and API endpoints
│   ├── main.c++                  # Existing C++ application entry point
│   ├── api_bridge.cPP            # Existing Node-to-C++ bridge
│   ├── api_bridge.exe            # Existing Windows bridge executable
│   ├── main.exe                  # Existing compiled executable
│   ├── models/                   # Existing C++ data models
│   │   ├── user.h
│   │   ├── students.h
│   │   ├── menuItems.h
│   │   └── orders.h
│   ├── services/                 # Existing C++ business logic
│   │   ├── canteenSystem.h
│   │   └── orderSystem.h
│   ├── file storage/             # Existing file-storage implementation
│   │   └── storage.h
│   ├── data/                     # Existing text data files
│   │   ├── students.txt
│   │   └── orders.txt
│   └── utils/                    # Existing QR generation utilities
│       ├── qr_generator.cpp
│       ├── qrcodegen.cpp
│       └── qrcodegen.hpp
├── frontend/
│   ├── index.html                # Existing entry page
│   ├── login.html                # Existing login UI
│   ├── logincss.css              # Existing login styles
│   ├── homepage.html             # Existing student homepage
│   ├── home.css                  # Existing homepage styles
│   ├── home.js                   # Existing homepage logic
│   ├── admin.html                # New admin portal UI
│   ├── admin.css                 # New admin portal styles
│   ├── admin.js                  # New admin portal UI logic (sample data currently)
│   ├── logo.png
│   ├── loginpagebg.png
│   └── qrcodes/
├── docs/
│   ├── OOP_DSA_MAPPING.md
│   ├── PROJECT_STRUCTURE.md      # This guide
│   └── ADMIN_PORTAL_INTEGRATION.md
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Future additions (do not create until implementing authentication)

When Supabase Auth and real admin operations are added, keep them as separate Node modules rather than mixing all logic into `server.js`:

```text
backend/
├── config/
│   └── supabaseClient.js         # Server-only Supabase client/config
├── middleware/
│   ├── authenticate.js           # Verify Supabase access token
│   └── requireAdmin.js           # Check trusted admin role
├── routes/
│   ├── authRoutes.js             # Optional auth-related endpoints
│   ├── adminMenuRoutes.js        # Admin menu CRUD endpoints
│   └── tokenRoutes.js            # College-ID lookup and token credit
└── services/
    ├── canteenSystem.h           # Existing C++ header, keep as-is
    └── ...                       # Future JS service modules can be separate files
```

The above is a target for later implementation, not code already wired into the application. Do not move the existing C++ `services` files into a JavaScript folder.
