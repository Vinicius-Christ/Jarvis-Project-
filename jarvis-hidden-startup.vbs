Set WshShell = CreateObject("WScript.Shell")
' Ajuste o caminho abaixo para o executável gerado do seu app
appPath = "C:\Caminho\Para\O\Seu\JarvisDesktop.exe --hidden"
WshShell.Run """" & appPath & """", 0, False
