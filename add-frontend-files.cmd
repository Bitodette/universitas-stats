# Pindahkan file frontend ke folder temporary
mkdir temp_frontend
xcopy /E /I frontend\* temp_frontend\

# Hapus folder frontend asli
rd /s /q frontend

# Buat folder frontend baru
mkdir frontend

# Pindahkan kembali file
xcopy /E /I temp_frontend\* frontend\

# Hapus folder temporary
rd /s /q temp_frontend

# Tambahkan semua file frontend ke Git
git add frontend/
git commit -m "Add frontend as regular directory"
