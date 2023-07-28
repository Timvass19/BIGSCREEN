<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reponse extends Model
{
    protected $fillable = [
        'survey_token',
        'question_id',
        'answer',
    ];


    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
