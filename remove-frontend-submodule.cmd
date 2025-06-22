# Hapus entri submodule
git rm --cached frontend
git config -f .git/config --remove-section submodule.frontend

# Hapus file .gitmodules jika ada
git rm .gitmodules

# Commit perubahan
git add .
git commit -m "Remove frontend submodule reference"
