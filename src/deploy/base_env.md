---
order: 7
star: true
date: 2024-10-09
copyright: false
footer: true
category:
  - deploy
tag:
  - deploy
  - env
---





# 一键部署基础环境

> 通过Inno Setup 结合 安装脚本实现一键部署基础开发环境：java、mysql、redis、emqx



## 实现步骤

1. 下载对应软件解压包
2. 编写启动脚本，放在解压包目录
3. 安装Inno SetUp，编写打包exe的脚本。



## 环境脚本

### Java

`JavaInstall.bat` 放在 `bin` 目录

~~~bat
@echo off
chcp 65001 >nul
:: 检查是否以管理员权限运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    rem 请求管理员权限...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

echo  ------begin----

echo "%~dp0"

pushd %~dp0..
set jdkpath=%cd%
echo Java path: %jdkpath%

popd

rem 设置 JAVA_HOME 环境变量
setx JAVA_HOME "%jdkpath%" -m

rem 设置 CLASSPATH 环境变量，保留 dt.jar 和 tools.jar
setx CLASSPATH ".;%%JAVA_HOME%%\lib\tools.jar;%%JAVA_HOME%%\lib\dt.jar" -m

rem 打印当前 PATH 变量
echo %Path%

rem 检查 PATH 中是否已经有 JAVA_HOME，如果没有则追加
echo %Path% | find /i "%JAVA_HOME%" >nul
if %errorlevel% neq 0 (
    echo "PATH 中没有 JAVA_HOME，准备追加。"
    
    rem 使用 REG 命令修改系统 PATH 环境变量，追加 OpenJDK 的 bin 目录
    reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path /t REG_EXPAND_SZ /d "%Path%;%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin" /f

    rem 追加 PATH 变量（当前会话）
    setx Path "%JAVA_HOME%\bin;%Path%"
) else (
    echo "PATH 中已经包含 JAVA_HOME，无需追加。"
)

pause
~~~



### Mysql

`MysqlInstall.bat` 放在 `bin` 目录

~~~bat
@echo off
SETLOCAL

chcp 65001 >nul

:: 检查是否以管理员权限运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    rem 请求管理员权限...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

REM 定义日志文件路径，使用 .. 表示上级目录
set "LOG_FILE=%~dp0..\mysql_install_log.txt"

REM 切换到脚本所在目录
cd /d %~dp0

REM 初始化 MySQL 数据库
echo 正在初始化 MySQL 数据库... >> "%LOG_FILE%" 2>&1
"%cd%\mysqld.exe" --initialize-insecure --user=mysql --console >> "%LOG_FILE%" 2>&1

IF ERRORLEVEL 1 (
    echo MySQL 初始化失败，请检查错误信息。 >> "%LOG_FILE%" 2>&1
    exit /b 1
)

echo -----MySQL 初始化成功----- >> "%LOG_FILE%" 2>&1

REM 设置 MYSQL_HOME 变量为上一级目录（即安装目录）
cd ..
set "MYSQL_HOME2=%cd%"
echo MYSQL_HOME2 设置为 %MYSQL_HOME2% >> "%LOG_FILE%" 2>&1

REM 创建实例配置文件
set "MY_INI=%MYSQL_HOME2%\my.ini"
echo [mysqld] > "%MY_INI%"
echo port=3306 >> "%MY_INI%"
echo server-id=1 >> "%MY_INI%"

REM 切换到 bin 目录
cd bin

REM 安装 MySQL 服务
mysqld install mysql --defaults-file="%MY_INI%" >> "%LOG_FILE%" 2>&1
IF ERRORLEVEL 1 (
    echo MySQL 服务安装失败，请检查错误信息。 >> "%LOG_FILE%" 2>&1
    exit /b 1
)

echo -----MySQL 服务安装成功----- >> "%LOG_FILE%" 2>&1

REM 启动 MySQL 服务并设置为自动启动
net start mysql >> "%LOG_FILE%" 2>&1
sc config mysql start= auto >> "%LOG_FILE%" 2>&1

REM 确保服务已停止并重新启动
net stop mysql >> "%LOG_FILE%" 2>&1
net start mysql >> "%LOG_FILE%" 2>&1

echo -----MySQL 服务已启动----- >> "%LOG_FILE%" 2>&1

cd ..

REM 设置 root 用户的密码
"%cd%\bin\mysqladmin" -u root password root >> "%LOG_FILE%" 2>&1
echo 修改密码完毕 >> "%LOG_FILE%" 2>&1

"%cd%\bin\mysql.exe" -uroot -proot < "%cd%\sql\kwin_access_door.sql"
echo 建表完毕 >> "%LOG_FILE%" 2>&1
ENDLOCAL

exit

~~~



### Redis

`RedisInstall.bat ` 放在根目录

~~~bat
@echo off
SETLOCAL

chcp 65001 >nul

:: 检查是否以管理员权限运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    rem 请求管理员权限...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

REM 获取当前脚本目录
SET SCRIPT_DIR=%~dp0

REM 切换到脚本目录
cd /d %SCRIPT_DIR%

REM 安装 Redis 为服务并设置开机自启动
echo 正在安装 Redis 服务...
redis-server.exe --service-install redis.windows-service.conf --loglevel verbose

IF %ERRORLEVEL% NEQ 0 (
    echo Redis 服务安装失败！
    exit /b 1
)

echo Redis 服务安装成功，设置为开机自启动！


ENDLOCAL
pause
~~~



### Emqx

`EmqxInstall.bat` 放在根目录，如果要开机启动，需要把脚本快捷方式放到开机启动文件夹中。

~~~bat
@echo off
SETLOCAL

REM EMQX 安装目录 (请根据实际路径进行修改)
SET EMQX_PATH=.\bin

REM 打印调试信息
echo Starting EMQX...

REM 切换到 EMQX 的 bin 目录
cd /d %EMQX_PATH%

REM 启动 EMQX
emqx start

REM 检查 EMQX 是否成功启动
emqx_ctl status

REM 如果启动成功，输出相关提示
IF %ERRORLEVEL% EQU 0 (
    echo EMQX start success！
) ELSE (
    echo EMQX start failed！
)

ENDLOCAL
pause
~~~



## Inno Setup 脚本

- 自行替换软件解压目录 `[Files]`

~~~iss
; 脚本由 Inno Setup 脚本向导 生成！
; 有关创建 Inno Setup 脚本文件的详细资料请查阅帮助文档！

#define MyAppName "Kwin BaseEnv"
#define MyAppVersion "1.0"
#define MyAppPublisher "kwin"
#define MyAppURL "https://trace.kwiniot.com/"

[Setup]
; 注: AppId的值为单独标识该应用程序。
; 不要为其他安装程序使用相同的AppId值。
; (若要生成新的 GUID，可在菜单中点击 "工具|生成 GUID"。)
AppId={{89B3184B-5278-4302-8456-5ADAC00E6B80}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
; 以下行取消注释，以在非管理安装模式下运行（仅为当前用户安装）。
;PrivilegesRequired=lowest
OutputDir=C:\Users\RAIN\Desktop
OutputBaseFilename=Kwin BaseEnv
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"


[Files]
Source: "C:\Users\RAIN\Documents\办公资料\试衣间部署\一键部署\kwinManager\base\java\*"; DestDir: "{app}\java"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\RAIN\Documents\办公资料\试衣间部署\一键部署\kwinManager\base\mysql\*"; DestDir: "{app}\mysql"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\RAIN\Documents\办公资料\试衣间部署\一键部署\kwinManager\base\emqx\*"; DestDir: "{app}\emqx"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\RAIN\Documents\办公资料\试衣间部署\一键部署\kwinManager\base\redis\*"; DestDir: "{app}\redis"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\RAIN\Documents\办公资料\试衣间部署\一键部署\kwinManager\base\tools\*"; DestDir: "{app}\tools"; Flags: ignoreversion recursesubdirs createallsubdirs
; 注意: 不要在任何共享系统文件上使用“Flags: ignoreversion”

[Icons]
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"

[INI]

;修改数据库配置文件   实际在脚本文件中配置

Filename:"{app}\mysql\my.ini";Section:"mysqld";Key:"basedir"; String:"{app}\mysql"

Filename:"{app}\mysql\my.ini";Section:"mysqld";Key:"datadir"; String:"{app}\mysql\data"

Filename:"{app}\mysql\my.ini";Section:"mysqld";Key:"port"; String:"3306"

[Run]
Filename: "{app}\java\bin\JavaInstall.bat";

Filename: "{app}\mysql\bin\Install.bat";

Filename: "{app}\emqx\start_emqx.bat";

Filename: "{app}\redis\Install.bat";

[UninstallDelete]

Type:filesandordirs;Name:"{app}\java"

Type:filesandordirs;Name:"{app}\mysql"

Type:filesandordirs;Name:"{app}\redis"

Type:filesandordirs;Name:"{app}\emqx"

Type:filesandordirs;Name:"{app}\tools"

~~~

