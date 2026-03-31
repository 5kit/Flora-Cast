**Flora-Cast** 

## Setup

### 1. Clone the Repository
Open your terminal or command prompt and run this command to download the project files to your machine:
```bash
git clone https://github.com/your-username/flora-cast.git
```
*(Replace the URL with your actual repository link.)*

### 2. Install Dependencies
Navigate into the newly created project folder and install the necessary packages (like `papaparse` and `react-scripts`):
```bash
cd flora-cast
npm install
```

### 3. Run the Application
Start the development server. This will compile the code and automatically open your browser to the dashboard:
```bash
npm start
```

---

### Quick Troubleshooting Check
* **Node.js**: Ensure you have Node.js installed; otherwise, the `npm` commands won't work.
* **The CSV File**: Verify that `plants.csv` is located in the `/public` folder.
* **Backgrounds**: Ensure your seasonal images are in `src/backgrounds/` as referenced in your `App.js` imports.
* **API-key**: Ensure a valid API key is in `src/Weather.js` file. 
