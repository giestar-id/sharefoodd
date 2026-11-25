@echo off
title Membuka FigCraft Live - ShareFood Desain System
echo ===================================================
echo   MEMBUKA FIGCRAFT LIVE UNTUK SHAREFOOD DESAIN
echo   Port Kontrol Otomasi AI: 9001
echo ===================================================
cd /d "D:\FIGCRAFT\FigCraft"
start "" "figcraft.exe" --control 9001 "d:\TUGAS_KULIAH\SEMESTER_5\claude-computing\sharefood\desain\sharefood_design.figcraft"
echo FigCraft berhasil dibuka secara live!
