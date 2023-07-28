<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\PersonalAccessToken;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\AdminResource;

class AdminController extends Controller
{
    /**
     * Enregistre un nouvel utilisateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        // On essaie de vérifier les données fournies par la requête
        // En cas d'erreur on la récupère et on retourne cette erreur
        try {
            $request->validate([
                'name' => 'required|string',
                'email' => 'required|email:filter',
                'password' => 'required|string',
            ]);
        }
        catch (\Exception $e) {
            $error = $e->getMessage();
            return response()->json([
                                        'error' => $error,
                                        'status' => 'failed'
                                    ], 202);
        }

        // Si tout se passe bien on créé l'utilisateur
        // Avec les paramètres fournis dans la requête
        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => Hash::make($request->password),
            "is_admin"=>1,
        ]);

        // On retourne un status
        return (new AdminResource($user))->additional([
                                                        'error' => '',
                                                        'status' => 'done'
                                                    ]);
    }

    /**
     * Connecte un nouvel utilisateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        // On essaie de vérifier les données fournies par la requête
        // En cas d'erreur on la récupère et on retourne cette erreur
        try {
            $request->validate([
                "email" => "required|email:rfc",
                "password" => "required|string",
            ]);
        }
        catch (\Exception $e) {
            $error = $e->getMessage();
            return response()->json([
                                        'error' => $error,
                                        'status' => 'failed'
                                    ], 202);
        }

        // Tentative de récupération de l'utilsateur
        // A partir de l'email fourni par la requête
        $user = User::where(['email' => $request->email])->first();

        // Si une instance nulle est retournée
        if (!$user) {
            return response()->json([
                                        'error' => 'Adresse email inconnue',
                                        'status' => 'failed'
                                    ], 202);
        }

        // On vérifie le mot de passe de la requête
        // En cas d'erreur de correspondance, on renvoie l'erreur
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                                        'error' => 'Mot de passe incorrect ',
                                        'status' => 'failed'
                                    ], 202);
        }

        // Si tout se passe bien, on créé le token
        $token = $user->createToken("token",  ['*'], now()->addHours(15))->plainTextToken;

        // La reponse est retounée
        return response()->json([
                                    'error' => '',
                                    'token' => $token,
                                    'userId' => $user->id,
                                    'message' => "Connexion reussie",
                                    'status' => 'done'
                                ], 200);
    }

    /**
     * Déconnecte un utilisateur
     *
     * @param  int  $id
     * @param  string  $token
     * @return \Illuminate\Http\Response
     */
    public function logout($id = null, $token = null)
    {
        // On essaie de retrouver l'utilisateur à partir de son id
        // En cas d'erreur on la récupère et on retourne cette erreur
        try {
            $user = User::findOrFail($id);
        } catch (\Exception $e) {
            return response()->json([
                                        'error' => $e->getMessage(),
                                        'status' => 'failed'
                                    ], 202);
        }

        // Si tout se passe bien
        // On supprime tous les tokens
        $user->tokens()->delete();

        // La reponse est retounée
        return response()->json([
                                    'error' => '',
                                    'message' => "Deconnexion reussie",
                                    'status' => 'done'
                                ], 200);
    }

    /**
     * Vérifie si l'utilisateur est connecté
     *
     * @param  string  $token
     * @return \Illuminate\Http\Response
     */
    public function logged($token = null)
    {
        // On essaie de retrouver controler le token
        // En cas d'erreur on la récupère et on retourne cette erreur
        try {
            $isTokenChecked = PersonalAccessToken::checkToken($token);
        }
        catch (\Exception $e) {
            return response()->json([
                                        'error' => $e->getMessage(),
                                        'status' => 'failed'
                                    ], 202);
        }

        // La reponse est retounée si le token est valide
        // Dans le cas contraire le middleware prendre le relais
        if ($isTokenChecked) {
            return response()->json([
                                        'error' => '',
                                        'message' => "Utilisateur connecté(e)",
                                        'status' => 'done'
                                    ], 200);
        }
    }
}
