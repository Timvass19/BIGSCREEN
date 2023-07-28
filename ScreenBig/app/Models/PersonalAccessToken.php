<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    /**
     * Vérifie si le token fourni est actif (existe et non expiré)
     *
     * @param  string  $token
     * @return boolean
     */
    public static function checkToken($token)
    {
        $freshToken = self::findToken($token);

        return ( ($freshToken = self::findToken($token)) && ( is_null(optional($freshToken)->expires_at) || optional($freshToken)->expires_at > now() ) );
    }

}
