<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SurveyController;

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


// Route pour l'enregistrement d'un nouvel utilisateur
Route::post('/user/register',[AdminController::class, "register"]);
// Route pour connecter un utilisateur au système
Route::post('/user/login',[AdminController::class, "login"]);


// Routes protégées par le middleware "trusttoken" (Empêche les URL appelées sans token valide d'accèder au système)

Route::middleware('trusttoken')->group(function() {

    // Route pour vérifier si l'admin est connecté
    Route::get('/user/logged/{token?}',[AdminController::class, "logged"]);

    // Route pour déconnecter l'admin
    Route::get('/user/logout/{id}/{token?}',[AdminController::class, "logout"]);


});



Route::get('/questions', [SurveyController::class, 'index']);

Route::post('/reponses', [SurveyController::class, 'storeReponses']);

Route::post('/tableau', [SurveyController::class, 'getAllReponses']);

Route::get('/statistique', [SurveyController::class, 'getQuestionResponses']);

Route::get('/quality-statistique', [SurveyController::class, 'getQualityResponses']);


Route::get('reponses/{surveyToken}', [SurveyController::class, 'showReponses']);
