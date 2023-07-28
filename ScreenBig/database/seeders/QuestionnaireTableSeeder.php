<?php

namespace Database\Seeders;

use App\Models\Option;

use App\Models\Question;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class QuestionnaireTableSeeder extends Seeder
{
    public function run()
    {
        $questions = [
            [
                'title' => 'Votre adresse mail ?',
                'type' => 'B',
            ],
            [
                'title' => 'Votre âge ?',
                'type' => 'B',
            ],
            [
                'title' => 'Votre sexe ?',
                'type' => 'A',
                'options' => ['Homme', 'Femme', 'Préfère ne pas répondre'],
            ],
            [
                'title' => 'Nombre de personnes dans votre foyer (adulte & enfants – répondant inclus) ?',
                'type' => 'C',
            ],
            [
                'title' => 'Votre profession ?',
                'type' => 'B',
            ],
            [
                'title' => 'Quelle marque de casque VR utilisez-vous ?',
                'type' => 'A',
                'options' => ['Oculus Quest', 'Oculus Rift/s', 'HTC Vive', 'Windows Mixed Reality', 'Valve index'],
            ],
            [
                'title' => 'Sur quel magasin d’application achetez-vous des contenus VR ?',
                'type' => 'A',
                'options' => ['SteamVR', 'Occulus store', 'Viveport', 'Windows store'],
            ],
            [
                'title' => 'Quel casque envisagez-vous d’acheter dans un futur proche ?',
                'type' => 'A',
                'options' => ['Occulus Quest', 'Occulus Go', 'HTC Vive Pro', 'PSVR', 'Autre', 'Aucun'],
            ],
            [
                'title' => 'Au sein de votre foyer, combien de personnes utilisent votre casque VR pour regarder Bigscreen ?',
                'type' => 'C',
            ],
            [
                'title' => 'Vous utilisez principalement Bigscreen pour ….. ?',
                'type' => 'A',
                'options' => ['regarder la TV en direct', 'regarder des films', 'travailler', 'jouer en solo', 'jouer en équipe'],
            ],
            [
                'title' => 'Combien de points (de 1 à 5) donnez-vous à la qualité de l’image sur Bigscreen ?',
                'type' => 'C',
            ],
            [
                'title' => 'Combien de points (de 1 à 5) donnez-vous au confort d’utilisation de l’interface Bigscreen ?',
                'type' => 'C',
            ],
            [
                'title' => 'Combien de points (de 1 à 5) donnez-vous à la connexion réseau de Bigscreen ?',
                'type' => 'C',
            ],
            [
                'title' => 'Combien de points (de 1 à 5) donnez-vous à la qualité des graphismes 3D dans Bigscreen ?',
                'type' => 'C',
            ],
            [
                'title' => 'Combien de points (de 1 à 5) donnez-vous à la qualité audio dans Bigscreen ?',
                'type' => 'C',
            ],
            [
                'title' => 'Aimeriez-vous avoir des notifications plus précises au cours de vos sessions Bigscreen ?',
                'type' => 'A',
                'options' => ['Oui', 'Non'],
            ],
            [
                'title' => 'Aimeriez-vous pouvoir inviter un ami à rejoindre votre session via son smartphone ?',
                'type' => 'A',
                'options' => ['Oui', 'Non'],
            ],
            [
                'title' => 'Aimeriez-vous pouvoir enregistrer des émissions TV pour pouvoir les regarder ultérieurement ?',
                'type' => 'A',
                'options' => ['Oui', 'Non'],
            ],
            [
                'title' => 'Aimeriez-vous jouer à des jeux exclusifs sur votre Bigscreen ?',
                'type' => 'A',
                'options' => ['Oui', 'Non'],
            ],
            [
                'title' => 'Selon vous, quelle nouvelle fonctionnalité devrait exister sur Bigscreen ?',
                'type' => 'B',
            ],
        ];

        // ...

foreach ($questions as $question) {
    $existingQuestion = Question::where('title', $question['title'])->first();

    if (!$existingQuestion) {
        $createdQuestion = Question::create([
            'title' => $question['title'],
            'type' => $question['type'],
        ]);

        if (isset($question['options'])) {
            $options = $question['options'];
            $optionsData = [];

            foreach ($options as $option) {
                $optionsData[] = ['text' => $option, 'question_id' => $createdQuestion->id];
            }

            Option::insert($optionsData);
        }
    }
}

// ...

    }
}
