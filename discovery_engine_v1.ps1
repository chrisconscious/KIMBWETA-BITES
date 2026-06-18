param([string]$Token)
$base="http://localhost:3000"; $pass=0; $fail=0; $results=@()
$testPhone="07123$(Get-Random -Max 99999)"; $imgPath="$env:TEMP\test_img.png"
function N($n){$script:nm=$n}
function A($c,$m){if($c){$script:pass++;Write-Host "  PASS: $script:nm"}else{$script:fail++;$s="$script:nm : FAIL - $m";$script:results+=$s;Write-Host "  $s"}}
function Get-J($u,$t){try{$w=New-Object System.Net.WebClient;if($t){$w.Headers.Add('Authorization',"Bearer $t")};$r=$w.DownloadString($u);return($r|ConvertFrom-Json),$null}catch{return $null,$_.Exception.Message}}
function Post-J($u,$b,$t){try{$e=[Text.Encoding]::ASCII.GetBytes($b);$w=New-Object System.Net.WebClient;$w.Headers.Add('Content-Type','application/json');if($t){$w.Headers.Add('Authorization',"Bearer $t")};$r=[Text.Encoding]::UTF8.GetString($w.UploadData($u,'POST',$e));return($r|ConvertFrom-Json),$null}catch{return $null,$_.Exception.Message}}
function Patch-J($u,$b,$t){try{$e=[Text.Encoding]::ASCII.GetBytes($b);$w=New-Object System.Net.WebClient;$w.Headers.Add('Content-Type','application/json');if($t){$w.Headers.Add('Authorization',"Bearer $t")};$r=[Text.Encoding]::UTF8.GetString($w.UploadData($u,'PATCH',$e));return($r|ConvertFrom-Json),$null}catch{return $null,$_.Exception.Message}}

if(-not(Test-Path $imgPath)){[IO.File]::WriteAllBytes($imgPath,@(0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41,0x54,0x08,0xD7,0x63,0x60,0x60,0x00,0x00,0x00,0x04,0x00,0x01,0x27,0x34,0x27,0x0C,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82))}

Write-Host '============================================'
Write-Host '   DISCOVERY ENGINE V1 - Full System Audit'
Write-Host '============================================'
Write-Host "Server: $base, Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "`n--- 1. HEALTH ---"
N 'Health check'; $r,$e=Get-J "$base/health" $null; A ($r -and $r.status -eq 'healthy') "$e"
N 'Server version'; A ($r -and $r.version) 'no version field'

Write-Host "`n--- 2. PUBLIC ENDPOINTS ---"
$tests=@(
  @{n='Public products';u="$base/api/v1/products/public"}
  @{n='Active ads';u="$base/api/v1/ads/active"}
  @{n='Active campuses';u="$base/api/v1/campuses"}
  @{n='Payment details';u="$base/api/v1/payment-details"}
  @{n='Social links';u="$base/api/v1/social-links"}
  @{n='Public categories';u="$base/api/v1/categories/public"}
  @{n='Public settings';u="$base/api/v1/settings/public"}
)
foreach($t in $tests){N $t.n; $r,$e=Get-J $t.u $null; A ($r -ne $null) "err"}

Write-Host "`n--- 3. AUTH ---"
N 'Registration'; $b=@{phoneNumber=$testPhone;password='Test123456';name='DA Test';role='customer'}|ConvertTo-Json -Compress; $r,$e=Post-J "$base/api/v1/auth/register" $b $null; A ($r -and $r.success) "$e"
N 'Weak password'; $b2='{"phoneNumber":"0722200001","password":"weak","name":"Weak Test"}'; $r,$e=Post-J "$base/api/v1/auth/register" $b2 $null; A ($e -match '400') 'weak pw not rejected'
N 'Wrong password'; $b3='{"phoneNumber":"0757744555","password":"WrongPassword123"}'; $r,$e=Post-J "$base/api/v1/auth/login" $b3 $null; A ($e -match '401') 'wrong pw not rejected'
N 'Success login'; $b4='{"phoneNumber":"0757744555","password":"Lema16family"}'; $r,$e=Post-J "$base/api/v1/auth/login" $b4 $null; A ($r -and $r.data.accessToken) "login failed"
$refTok=$r.data.refreshToken
N 'Token refresh'; $refreshBody = @{refreshToken=$refTok} | ConvertTo-Json -Compress; $r2,$e2=Post-J "$base/api/v1/auth/token/refresh" $refreshBody $null; A ($r2 -and $r2.data.accessToken) "refresh failed"
N 'No auth guard'; $r,$e=Get-J "$base/api/v1/users" $null; A ($e -match '401') "no 401"
N 'Logout'; $r,$e=Post-J "$base/api/v1/auth/logout" '{}' $Token; A ($r -and $r.success) "logout failed"

Write-Host "`n--- 4. CORS & SECURITY ---"
try{$resp=Invoke-WebRequest -Uri "$base/health" -UseBasicParsing; N 'CORS headers'; A ($resp.Headers['Access-Control-Allow-Origin'] -or $resp.Headers['Access-Control-Allow-Credentials']) 'no CORS'; N 'Security headers'; $m=@('Content-Security-Policy','X-Content-Type-Options','Strict-Transport-Security')|Where-Object{-not$resp.Headers[$_]}; A ($m.Count -eq 0) "missing: $($m-join',')"; N 'Rate limit headers'; $r2=Invoke-WebRequest -Uri "$base/api/v1/products/public" -UseBasicParsing; A ($r2.Headers['RateLimit-Remaining']) 'no rate limit'; N 'CORS preflight'; $r3=Invoke-WebRequest -Uri "$base/api/v1/products/public" -Method Options -UseBasicParsing; A ($r3.StatusCode -eq 204 -or $r3.StatusCode -eq 200) "got $($r3.StatusCode)"}catch{A $false $_.Exception.Message}

Write-Host "`n--- 5. FILE UPLOADS ---"
try{$w=New-Object System.Net.WebClient;$w.Headers.Add('Authorization',"Bearer $Token");$resp=[Text.Encoding]::UTF8.GetString($w.UploadFile("$base/api/v1/categories/upload-icon",$imgPath));$j=$resp|ConvertFrom-Json;N 'Category icon'; A ($j.success -and $j.data.url -match '^https?://') "url=$($j.data.url)"}catch{A $false $_.Exception.Message}
try{$w2=New-Object System.Net.WebClient;$w2.Headers.Add('Authorization',"Bearer $Token");$resp=[Text.Encoding]::UTF8.GetString($w2.UploadFile("$base/api/v1/ads/upload",$imgPath));$j=$resp|ConvertFrom-Json;N 'Ad media'; A ($j.success -and $j.data.url -match '^https?://') "url=$($j.data.url)"}catch{A $false $_.Exception.Message}
try{$w3=New-Object System.Net.WebClient;$w3.Headers.Add('Authorization',"Bearer $Token");$resp=[Text.Encoding]::UTF8.GetString($w3.UploadFile("$base/api/v1/settings/upload-logo",$imgPath));$j=$resp|ConvertFrom-Json;N 'Settings logo'; A ($j.success -and $j.data.url -match '^https?://') "url=$($j.data.url)"}catch{A $false $_.Exception.Message}

Write-Host "`n--- 6. ORDERS LIFECYCLE ---"
$ordBody='{"items":[{"productId":"88af0c9f-aa95-425a-b064-b02a510953eb","quantity":1}],"campusId":"c1000000-0000-0000-0000-000000000005","locationText":"Discovery Test","paymentMethod":"CASH"}'
N 'Create order'; $r,$e=Post-J "$base/api/v1/orders" $ordBody $Token; A ($r -and $r.data.id) "create: $e"
$oid=$r.data.id
N 'Get order'; $r,$e=Get-J "$base/api/v1/orders/$oid" $Token; A ($r -and $r.data.id -eq $oid) "get: $e"
foreach($s in @('ACCEPTED','PREPARING','ON_THE_WAY','DELIVERED')){
  N "Status -> $s"
  try{$pw=Invoke-WebRequest -Uri "$base/api/v1/orders/$oid/status" -Method Patch -Body "{`"status`":`"$s`"}" -ContentType 'application/json' -Headers @{Authorization="Bearer $Token"} -UseBasicParsing;$pwd=$pw.Content|ConvertFrom-Json;A ($pwd.success -and $pwd.data.status -eq $s) "expected $s, got $($pwd.data.status)"}catch{A $false $_.Exception.Message}
}
N 'List orders'; $r,$e=Get-J "$base/api/v1/orders" $Token; A ($r -and $r.success) "list: $e"

Write-Host "`n--- 7. CAMPUS ---"
N 'Admin list'; $r,$e=Get-J "$base/api/v1/campuses/all" $Token; A ($r -and $r.success) "admin: $e"
N 'Public list'; $r,$e=Get-J "$base/api/v1/campuses" $null; A ($r -and $r.success) "public: $e"

Write-Host "`n--- 8. CATEGORIES ---"
N 'Admin categories'; $r,$e=Get-J "$base/api/v1/categories" $Token; A ($r -and $r.success) "admin: $e"
N 'Public categories'; $r,$e=Get-J "$base/api/v1/categories/public" $null; A ($r -and $r.success) "public: $e"

Write-Host "`n--- 9. PRODUCTS ---"
N 'Admin products'; $r,$e=Get-J "$base/api/v1/products" $Token; A ($r -and $r.success) "admin: $e"
N 'Public products'; $r,$e=Get-J "$base/api/v1/products/public" $null; A ($r -and $r.success) "public: $e"
if($r -and $r.data -and $r.data.data -and $r.data.data.Count -gt 0){
  $prodId=$r.data.data[0].id; N 'Get product by ID'; $r2,$e2=Get-J "$base/api/v1/products/$prodId" $Token; A ($r2 -and $r2.data.id -eq $prodId) "by id: $e2"
}

Write-Host "`n--- 10. USERS ---"
N 'Current user'; $r,$e=Get-J "$base/api/v1/users/me" $Token; A ($r -and $r.data) "me: $e"
N 'All users'; $r,$e=Get-J "$base/api/v1/users" $Token; A ($r -and $r.success) "list: $e"

Write-Host "`n--- 11. SETTINGS & SOCIAL ---"
N 'Settings'; $r,$e=Get-J "$base/api/v1/settings" $Token; A ($r -and $r.success) "settings: $e"
N 'Social links'; $r,$e=Get-J "$base/api/v1/social-links/all" $Token; A ($r -and $r.success) "social: $e"

Write-Host "`n--- 12. NOTIFICATIONS ---"
N 'Notifications'; $r,$e=Get-J "$base/api/v1/notifications" $Token; A ($r -and $r.success) "notif: $e"
N 'Unread count'; $r,$e=Get-J "$base/api/v1/notifications/unread-count" $Token; A ($r -and $r.success) "unread: $e"

Write-Host "`n--- 13. ADS ---"
N 'Admin ads'; $r,$e=Get-J "$base/api/v1/ads" $Token; A ($r -and $r.success) "ads: $e"
N 'Active ads'; $r,$e=Get-J "$base/api/v1/ads/active" $null; A ($r -and $r.success) "active: $e"

Write-Host "`n--- 14. SUPER ADMIN ---"
N 'Dashboard'; $r,$e=Get-J "$base/api/v1/super-admin/dashboard" $Token; A ($r -and $r.success) "dash: $e"
N 'Analytics'; $r,$e=Get-J "$base/api/v1/analytics/report" $Token; A ($r -and $r.success) "analytics: $e"
N 'Customer insights'; $r,$e=Get-J "$base/api/v1/super-admin/customer-insights" $Token; A ($r -and $r.success) "insights: $e"
N 'Share analytics'; $r,$e=Get-J "$base/api/v1/super-admin/share-analytics" $Token; A ($r -and $r.success) "shares: $e"
N 'Product requests'; $r,$e=Get-J "$base/api/v1/super-admin/product-requests" $Token; A ($r -and $r.success) "req: $e"
N 'Users (admin)'; $r,$e=Get-J "$base/api/v1/super-admin/users" $Token; A ($r -and $r.success) "users: $e"

Write-Host "`n--- 15. RIDERS ---"
N 'Delivery riders'; $r,$e=Get-J "$base/api/v1/delivery-riders" $Token; A ($r -and $r.success) "riders: $e"

# Summary
$total=$pass+$fail
Write-Host "`n============================================"
Write-Host "          DISCOVERY ENGINE V1"
Write-Host "============================================"
Write-Host "  Total tests: $total"
Write-Host "  Passed:      $pass"
Write-Host "  Failed:      $fail"
if($fail -eq 0){Write-Host "  STATUS: ALL PASSED"}else{Write-Host "  STATUS: FAILURES DETECTED"}
Write-Host "============================================"
if($results.Count -gt 0){Write-Host "`nFAILURES:"; $results|ForEach-Object{Write-Host "  $_"}}
if($fail -gt 0){exit 1}else{exit 0}
