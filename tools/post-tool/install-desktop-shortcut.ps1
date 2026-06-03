$ErrorActionPreference = 'Stop'

$toolDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $toolDir '..\..')
$launcher = Join-Path $toolDir 'launch.cmd'

if (-not (Test-Path $launcher)) {
  throw "Launcher not found: $launcher"
}

$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutName = 'ViteX ' + [string]([char]0x53D1) + [string]([char]0x5E16) + '.lnk'
$shortcutPath = Join-Path $desktop $shortcutName

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcher
$shortcut.WorkingDirectory = $projectRoot.Path
$shortcut.Description = 'Start ViteX local post tool'
$shortcut.WindowStyle = 1
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
$shortcut.Save()

Write-Host "Created desktop shortcut: $shortcutPath"
Write-Host 'Double-click it to open the local post tool.'
