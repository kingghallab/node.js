## Node.js Projects Repository

This repository contains **two separate** Node.js applications, each demonstrating different API patterns:

1. **Blog-App-Using-REST-APIs**  
2. **E-Commerce-App-Non-RestfulAPIs**

You’ll need to install and run them independently.

---

## Table of Contents

- [Introduction](#introduction)  
- [Projects](#projects)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Folder Structure](#folder-structure)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## Introduction

This repository is intended as an educational resource to illustrate two different approaches to building backend services with Node.js:

- A **RESTful Blog API**, showing standard REST conventions.  
- An **E‑Commerce API** using non‑RESTful endpoints to explore alternative patterns.

---

## Projects

### 1. Blog-App-Using-REST-APIs

A simple blogging platform exposing RESTful endpoints for creating, reading, updating, and deleting posts and comments.

### 2. E-Commerce-App-Non-RestfulAPIs

An online store backend using custom, non‑RESTful routes for cart management, orders, and product catalogs.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)  
- npm (bundled with Node.js) or yarn  

---

## Installation

You must install dependencies separately in each sub‑project folder:

```bash
# Clone this repository
git clone https://github.com/kingghallab/node.js.git
cd node.js

# Installing dependencies for the Blog app
cd Blog-App-Using-REST-APIs
npm install

# Installing dependecies for the E‑Commerce app
cd ..
cd E-Commerce-App-Non-RestfulAPIs
npm install
```

> Each folder has its own `package.json` and must be set up independently.

---

## Usage

Launch each app in its own terminal:

```bash
# In Blog-App-Using-REST-APIs
# open 2 terminal instances
# one for frontend the server (React) and one for the Backend server (Node)
# terminal instance 1
cd node 
npm start
# terminal instance 2
cd react
npm start
```

```bash
# In E-Commerce-App-Non-RestfulAPIs
npm start
```

By default, both services run on different ports (see each project’s README or `.env.example` for details).

---

## Folder Structure

```
node.js/
├── Blog-App-Using-REST-APIs/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
└── E-Commerce-App-Non-RestfulAPIs/
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    └── ...
```

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/XYZ`)  
3. Commit your changes (`git commit -m "Add XYZ"`)  
4. Push to your branch (`git push origin feature/XYZ`)  
5. Open a pull request  

---

## License

This project is licensed under MIT. See the [LICENSE](LICENSE) file for details.

---
