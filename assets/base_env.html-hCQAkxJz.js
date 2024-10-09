import{_ as e,o as n,c as i,d as s}from"./app-D_rNMysR.js";const l={},d=s(`<h1 id="一键部署基础环境" tabindex="-1"><a class="header-anchor" href="#一键部署基础环境"><span>一键部署基础环境</span></a></h1><blockquote><p>通过Inno Setup 结合 安装脚本实现一键部署基础开发环境：java、mysql、redis、emqx</p></blockquote><h2 id="实现步骤" tabindex="-1"><a class="header-anchor" href="#实现步骤"><span>实现步骤</span></a></h2><ol><li>下载对应软件解压包</li><li>编写启动脚本，放在解压包目录</li><li>安装Inno SetUp，编写打包exe的脚本。</li></ol><h2 id="环境脚本" tabindex="-1"><a class="header-anchor" href="#环境脚本"><span>环境脚本</span></a></h2><h3 id="java" tabindex="-1"><a class="header-anchor" href="#java"><span>Java</span></a></h3><p><code>JavaInstall.bat</code> 放在 <code>bin</code> 目录</p><div class="language-bat line-numbers-mode" data-ext="bat" data-title="bat"><pre class="language-bat"><code>@echo off
chcp 65001 &gt;nul
:: 检查是否以管理员权限运行
net session &gt;nul 2&gt;&amp;1
if %errorLevel% neq 0 (
    rem 请求管理员权限...
    powershell -Command &quot;Start-Process &#39;%~f0&#39; -Verb runAs&quot;
    exit /b
)

echo  ------begin----

echo &quot;%~dp0&quot;

pushd %~dp0..
set jdkpath=%cd%
echo Java path: %jdkpath%

popd

rem 设置 JAVA_HOME 环境变量
setx JAVA_HOME &quot;%jdkpath%&quot; -m

rem 设置 CLASSPATH 环境变量，保留 dt.jar 和 tools.jar
setx CLASSPATH &quot;.;%%JAVA_HOME%%\\lib\\tools.jar;%%JAVA_HOME%%\\lib\\dt.jar&quot; -m

rem 打印当前 PATH 变量
echo %Path%

rem 检查 PATH 中是否已经有 JAVA_HOME，如果没有则追加
echo %Path% | find /i &quot;%JAVA_HOME%&quot; &gt;nul
if %errorlevel% neq 0 (
    echo &quot;PATH 中没有 JAVA_HOME，准备追加。&quot;
    
    rem 使用 REG 命令修改系统 PATH 环境变量，追加 OpenJDK 的 bin 目录
    reg add &quot;HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment&quot; /v Path /t REG_EXPAND_SZ /d &quot;%Path%;%JAVA_HOME%\\bin;%JAVA_HOME%\\jre\\bin&quot; /f

    rem 追加 PATH 变量（当前会话）
    setx Path &quot;%JAVA_HOME%\\bin;%Path%&quot;
) else (
    echo &quot;PATH 中已经包含 JAVA_HOME，无需追加。&quot;
)

pause
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="mysql" tabindex="-1"><a class="header-anchor" href="#mysql"><span>Mysql</span></a></h3><p><code>MysqlInstall.bat</code> 放在 <code>bin</code> 目录</p><div class="language-bat line-numbers-mode" data-ext="bat" data-title="bat"><pre class="language-bat"><code>@echo off
SETLOCAL

chcp 65001 &gt;nul

:: 检查是否以管理员权限运行
net session &gt;nul 2&gt;&amp;1
if %errorLevel% neq 0 (
    rem 请求管理员权限...
    powershell -Command &quot;Start-Process &#39;%~f0&#39; -Verb runAs&quot;
    exit /b
)

REM 定义日志文件路径，使用 .. 表示上级目录
set &quot;LOG_FILE=%~dp0..\\mysql_install_log.txt&quot;

REM 切换到脚本所在目录
cd /d %~dp0

REM 初始化 MySQL 数据库
echo 正在初始化 MySQL 数据库... &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
&quot;%cd%\\mysqld.exe&quot; --initialize-insecure --user=mysql --console &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

IF ERRORLEVEL 1 (
    echo MySQL 初始化失败，请检查错误信息。 &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
    exit /b 1
)

echo -----MySQL 初始化成功----- &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

REM 设置 MYSQL_HOME 变量为上一级目录（即安装目录）
cd ..
set &quot;MYSQL_HOME2=%cd%&quot;
echo MYSQL_HOME2 设置为 %MYSQL_HOME2% &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

REM 创建实例配置文件
set &quot;MY_INI=%MYSQL_HOME2%\\my.ini&quot;
echo [mysqld] &gt; &quot;%MY_INI%&quot;
echo port=3306 &gt;&gt; &quot;%MY_INI%&quot;
echo server-id=1 &gt;&gt; &quot;%MY_INI%&quot;

REM 切换到 bin 目录
cd bin

REM 安装 MySQL 服务
mysqld install mysql --defaults-file=&quot;%MY_INI%&quot; &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
IF ERRORLEVEL 1 (
    echo MySQL 服务安装失败，请检查错误信息。 &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
    exit /b 1
)

echo -----MySQL 服务安装成功----- &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

REM 启动 MySQL 服务并设置为自动启动
net start mysql &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
sc config mysql start= auto &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

REM 确保服务已停止并重新启动
net stop mysql &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
net start mysql &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

echo -----MySQL 服务已启动----- &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

cd ..

REM 设置 root 用户的密码
&quot;%cd%\\bin\\mysqladmin&quot; -u root password root &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
echo 修改密码完毕 &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1

&quot;%cd%\\bin\\mysql.exe&quot; -uroot -proot &lt; &quot;%cd%\\sql\\kwin_access_door.sql&quot;
echo 建表完毕 &gt;&gt; &quot;%LOG_FILE%&quot; 2&gt;&amp;1
ENDLOCAL

exit

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="redis" tabindex="-1"><a class="header-anchor" href="#redis"><span>Redis</span></a></h3><p><code>RedisInstall.bat </code> 放在根目录</p><div class="language-bat line-numbers-mode" data-ext="bat" data-title="bat"><pre class="language-bat"><code>@echo off
SETLOCAL

chcp 65001 &gt;nul

:: 检查是否以管理员权限运行
net session &gt;nul 2&gt;&amp;1
if %errorLevel% neq 0 (
    rem 请求管理员权限...
    powershell -Command &quot;Start-Process &#39;%~f0&#39; -Verb runAs&quot;
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="emqx" tabindex="-1"><a class="header-anchor" href="#emqx"><span>Emqx</span></a></h3><p><code>EmqxInstall.bat</code> 放在根目录，如果要开机启动，需要把脚本快捷方式放到开机启动文件夹中。</p><div class="language-bat line-numbers-mode" data-ext="bat" data-title="bat"><pre class="language-bat"><code>@echo off
SETLOCAL

REM EMQX 安装目录 (请根据实际路径进行修改)
SET EMQX_PATH=.\\bin

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="inno-setup-脚本" tabindex="-1"><a class="header-anchor" href="#inno-setup-脚本"><span>Inno Setup 脚本</span></a></h2><ul><li>自行替换软件解压目录 <code>[Files]</code></li></ul><div class="language-iss line-numbers-mode" data-ext="iss" data-title="iss"><pre class="language-iss"><code>; 脚本由 Inno Setup 脚本向导 生成！
; 有关创建 Inno Setup 脚本文件的详细资料请查阅帮助文档！

#define MyAppName &quot;Kwin BaseEnv&quot;
#define MyAppVersion &quot;1.0&quot;
#define MyAppPublisher &quot;kwin&quot;
#define MyAppURL &quot;https://trace.kwiniot.com/&quot;

[Setup]
; 注: AppId的值为单独标识该应用程序。
; 不要为其他安装程序使用相同的AppId值。
; (若要生成新的 GUID，可在菜单中点击 &quot;工具|生成 GUID&quot;。)
AppId={{89B3184B-5278-4302-8456-5ADAC00E6B80}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\\{#MyAppName}
DefaultGroupName={#MyAppName}
; 以下行取消注释，以在非管理安装模式下运行（仅为当前用户安装）。
;PrivilegesRequired=lowest
OutputDir=C:\\Users\\RAIN\\Desktop
OutputBaseFilename=Kwin BaseEnv
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: &quot;chinesesimp&quot;; MessagesFile: &quot;compiler:Default.isl&quot;


[Files]
Source: &quot;C:\\Users\\RAIN\\Documents\\办公资料\\试衣间部署\\一键部署\\kwinManager\\base\\java\\*&quot;; DestDir: &quot;{app}\\java&quot;; Flags: ignoreversion recursesubdirs createallsubdirs
Source: &quot;C:\\Users\\RAIN\\Documents\\办公资料\\试衣间部署\\一键部署\\kwinManager\\base\\mysql\\*&quot;; DestDir: &quot;{app}\\mysql&quot;; Flags: ignoreversion recursesubdirs createallsubdirs
Source: &quot;C:\\Users\\RAIN\\Documents\\办公资料\\试衣间部署\\一键部署\\kwinManager\\base\\emqx\\*&quot;; DestDir: &quot;{app}\\emqx&quot;; Flags: ignoreversion recursesubdirs createallsubdirs
Source: &quot;C:\\Users\\RAIN\\Documents\\办公资料\\试衣间部署\\一键部署\\kwinManager\\base\\redis\\*&quot;; DestDir: &quot;{app}\\redis&quot;; Flags: ignoreversion recursesubdirs createallsubdirs
Source: &quot;C:\\Users\\RAIN\\Documents\\办公资料\\试衣间部署\\一键部署\\kwinManager\\base\\tools\\*&quot;; DestDir: &quot;{app}\\tools&quot;; Flags: ignoreversion recursesubdirs createallsubdirs
; 注意: 不要在任何共享系统文件上使用“Flags: ignoreversion”

[Icons]
Name: &quot;{group}\\{cm:UninstallProgram,{#MyAppName}}&quot;; Filename: &quot;{uninstallexe}&quot;

[INI]

;修改数据库配置文件   实际在脚本文件中配置

Filename:&quot;{app}\\mysql\\my.ini&quot;;Section:&quot;mysqld&quot;;Key:&quot;basedir&quot;; String:&quot;{app}\\mysql&quot;

Filename:&quot;{app}\\mysql\\my.ini&quot;;Section:&quot;mysqld&quot;;Key:&quot;datadir&quot;; String:&quot;{app}\\mysql\\data&quot;

Filename:&quot;{app}\\mysql\\my.ini&quot;;Section:&quot;mysqld&quot;;Key:&quot;port&quot;; String:&quot;3306&quot;

[Run]
Filename: &quot;{app}\\java\\bin\\JavaInstall.bat&quot;;

Filename: &quot;{app}\\mysql\\bin\\Install.bat&quot;;

Filename: &quot;{app}\\emqx\\start_emqx.bat&quot;;

Filename: &quot;{app}\\redis\\Install.bat&quot;;

[UninstallDelete]

Type:filesandordirs;Name:&quot;{app}\\java&quot;

Type:filesandordirs;Name:&quot;{app}\\mysql&quot;

Type:filesandordirs;Name:&quot;{app}\\redis&quot;

Type:filesandordirs;Name:&quot;{app}\\emqx&quot;

Type:filesandordirs;Name:&quot;{app}\\tools&quot;

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,20),a=[d];function v(r,u){return n(),i("div",null,a)}const c=e(l,[["render",v],["__file","base_env.html.vue"]]),m=JSON.parse(`{"path":"/deploy/base_env.html","title":"一键部署基础环境","lang":"zh-CN","frontmatter":{"order":7,"star":true,"date":"2024-10-09T00:00:00.000Z","copyright":false,"footer":true,"category":["deploy"],"tag":["deploy","env"]},"headers":[{"level":2,"title":"实现步骤","slug":"实现步骤","link":"#实现步骤","children":[]},{"level":2,"title":"环境脚本","slug":"环境脚本","link":"#环境脚本","children":[{"level":3,"title":"Java","slug":"java","link":"#java","children":[]},{"level":3,"title":"Mysql","slug":"mysql","link":"#mysql","children":[]},{"level":3,"title":"Redis","slug":"redis","link":"#redis","children":[]},{"level":3,"title":"Emqx","slug":"emqx","link":"#emqx","children":[]}]},{"level":2,"title":"Inno Setup 脚本","slug":"inno-setup-脚本","link":"#inno-setup-脚本","children":[]}],"git":{"createdTime":1728463897000,"updatedTime":1728463897000,"contributors":[{"name":"mxoop","email":"1592013653@qq.com","commits":1}]},"readingTime":{"minutes":4.72,"words":1417},"filePathRelative":"deploy/base_env.md","localizedDate":"2024年10月9日","excerpt":"\\n<blockquote>\\n<p>通过Inno Setup 结合 安装脚本实现一键部署基础开发环境：java、mysql、redis、emqx</p>\\n</blockquote>\\n<h2>实现步骤</h2>\\n<ol>\\n<li>下载对应软件解压包</li>\\n<li>编写启动脚本，放在解压包目录</li>\\n<li>安装Inno SetUp，编写打包exe的脚本。</li>\\n</ol>\\n<h2>环境脚本</h2>\\n<h3>Java</h3>\\n<p><code>JavaInstall.bat</code> 放在 <code>bin</code> 目录</p>\\n<div class=\\"language-bat\\" data-ext=\\"bat\\" data-title=\\"bat\\"><pre class=\\"language-bat\\"><code>@echo off\\nchcp 65001 &gt;nul\\n:: 检查是否以管理员权限运行\\nnet session &gt;nul 2&gt;&amp;1\\nif %errorLevel% neq 0 (\\n    rem 请求管理员权限...\\n    powershell -Command \\"Start-Process '%~f0' -Verb runAs\\"\\n    exit /b\\n)\\n\\necho  ------begin----\\n\\necho \\"%~dp0\\"\\n\\npushd %~dp0..\\nset jdkpath=%cd%\\necho Java path: %jdkpath%\\n\\npopd\\n\\nrem 设置 JAVA_HOME 环境变量\\nsetx JAVA_HOME \\"%jdkpath%\\" -m\\n\\nrem 设置 CLASSPATH 环境变量，保留 dt.jar 和 tools.jar\\nsetx CLASSPATH \\".;%%JAVA_HOME%%\\\\lib\\\\tools.jar;%%JAVA_HOME%%\\\\lib\\\\dt.jar\\" -m\\n\\nrem 打印当前 PATH 变量\\necho %Path%\\n\\nrem 检查 PATH 中是否已经有 JAVA_HOME，如果没有则追加\\necho %Path% | find /i \\"%JAVA_HOME%\\" &gt;nul\\nif %errorlevel% neq 0 (\\n    echo \\"PATH 中没有 JAVA_HOME，准备追加。\\"\\n    \\n    rem 使用 REG 命令修改系统 PATH 环境变量，追加 OpenJDK 的 bin 目录\\n    reg add \\"HKEY_LOCAL_MACHINE\\\\SYSTEM\\\\CurrentControlSet\\\\Control\\\\Session Manager\\\\Environment\\" /v Path /t REG_EXPAND_SZ /d \\"%Path%;%JAVA_HOME%\\\\bin;%JAVA_HOME%\\\\jre\\\\bin\\" /f\\n\\n    rem 追加 PATH 变量（当前会话）\\n    setx Path \\"%JAVA_HOME%\\\\bin;%Path%\\"\\n) else (\\n    echo \\"PATH 中已经包含 JAVA_HOME，无需追加。\\"\\n)\\n\\npause\\n</code></pre></div>"}`);export{c as comp,m as data};
