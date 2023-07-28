<!-- <?php

use App\Http\Resources\AdminResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;
use PhpParser\Node\Stmt\TryCatch;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/user/register', function(Request $request) {

    $request->validate([
        'name' => 'required|string',
        'email' => 'required|email:dns',
        'password' => 'required|string',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    return (new AdminResource($user))->additional(['status' => 'done']);

});

Route::post('/user/login', function(Request $request) {

    try {

        $request->validate([
            'email' => 'required|email:rfc',
            'password' => 'required|string',
        ]);
    }
    catch(\Throwable $e) {
        $e->getMessage();
    }

    $user = User::where('email', $request->email)->first();

    if ($user && Hash::check($request->password, $user->password)) {
        return response()->json([
            'status' => 'connected',
            'token' => $user->createToken('token', ['*'], now()->addMinutes(10))->plainTextToken,
        ]);
    }
    else
        return response()->json(['status' => 'failed']);
});

Route::get('/login', function(){
    return ["info" => "Vous devez vous connecter"];
})->name('login');


Route::get('/user/list/{token}/id', function(Request $request){
    if ($request->user()->tokenCan('*')) {
        return AdminResource::collection(User::limit(10)->paginate())->additional(['status' => 'done']);
    }
    else return response()->json(['status' => 'failed'], 200);
});
