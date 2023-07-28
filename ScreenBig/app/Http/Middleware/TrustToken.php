<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class TrustToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // On vérifie si la route courante a un certain paramètre de route
        if ($request->route()->hasParameter("token")) {

            if (PersonalAccessToken::checkToken($request->route()->token)) {
                return $next($request);
            }
            // Recupére une instance du modèle "PersonalAccessToken"
            // Correspondant à la ligne d'enregistrement d'un token
            // Egal à celui fournit en argument du findToken()
            // $token = PersonalAccessToken::findToken($request->route()->token);
            // }
        }
        // Sinon on retourne un message d'erreur à l'utilisateur
        // Avec un code d'état HTTP 200
        return response()->json([
                                    'error' => '',
                                    "Message" => "token non valide",
                                    'status' => 'failed'
                                ], 200);


    }
}
