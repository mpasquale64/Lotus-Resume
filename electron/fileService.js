const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class FileService {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.watcher = null;
  }

  startWatching(callback) {
    if (this.watcher) this.watcher.close();
    this.watcher = chokidar.watch(this.rootDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      depth: 10,
    });
    this.watcher
      .on('add', (filePath) => callback('add', filePath))
      .on('change', (filePath) => callback('change', filePath))
      .on('unlink', (filePath) => callback('unlink', filePath))
      .on('addDir', (dirPath) => callback('addDir', dirPath))
      .on('unlinkDir', (dirPath) => callback('unlinkDir', dirPath));
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  listFiles(dirPath) {
    const targetDir = dirPath || this.rootDir;
    if (!fs.existsSync(targetDir)) return [];

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    return entries
      .filter((entry) => !entry.name.startsWith('.'))
      .map((entry) => {
        const fullPath = path.join(targetDir, entry.name);
        const isDirectory = entry.isDirectory();
        return {
          name: entry.name,
          path: fullPath,
          isDirectory,
          children: isDirectory ? this.listFiles(fullPath) : undefined,
        };
      })
      .sort((a, b) => {
        // Directories first, then alphabetical
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  readFile(filePath) {
    if (!this._isInsideRoot(filePath)) return '';
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf-8');
  }

  writeFile(filePath, content) {
    if (!this._isInsideRoot(filePath)) return false;
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  createFile(filePath) {
    if (!this._isInsideRoot(filePath)) return false;
    if (fs.existsSync(filePath)) return false;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, '', 'utf-8');
    return true;
  }

  createDirectory(dirPath) {
    if (!this._isInsideRoot(dirPath)) return false;
    if (fs.existsSync(dirPath)) return false;
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }

  deleteFile(filePath) {
    if (!this._isInsideRoot(filePath)) return false;
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fs.rmSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
    return true;
  }

  renameFile(oldPath, newPath) {
    if (!this._isInsideRoot(oldPath) || !this._isInsideRoot(newPath)) return false;
    if (!fs.existsSync(oldPath)) return false;
    fs.renameSync(oldPath, newPath);
    return true;
  }

  search(query) {
    if (!query || query.length < 2) return [];
    const results = [];
    this._searchRecursive(this.rootDir, query.toLowerCase(), results);
    return results.slice(0, 50); // Limit results
  }

  _searchRecursive(dirPath, query, results) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        this._searchRecursive(fullPath, query, results);
      } else if (entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.toLowerCase().includes(query) || entry.name.toLowerCase().includes(query)) {
          const lines = content.split('\n');
          const matchLine = lines.findIndex((l) => l.toLowerCase().includes(query));
          results.push({
            path: fullPath,
            name: entry.name,
            preview: matchLine >= 0 ? lines[matchLine].trim().substring(0, 100) : '',
          });
        }
      }
    }
  }

  _isInsideRoot(filePath) {
    const resolved = path.resolve(filePath);
    return resolved.startsWith(path.resolve(this.rootDir));
  }
}

module.exports = { FileService };
