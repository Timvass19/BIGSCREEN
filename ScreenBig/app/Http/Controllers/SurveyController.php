<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Reponse;
use App\Models\Question;
use App\Models\Option;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SurveyController extends Controller
{
    public function index()
    {
        $questions = Question::all();

        // Convertir les options de réponse en tableau pour les questions de type A
        foreach ($questions as $question) {
            if ($question->type === 'A') {
                try {
                    $question->options = json_decode($question->options, true);
                } catch (Exception $e) {
                    $question->options = [];
                }
            }
        }

        // Renvoyer les données sous forme de réponse JSON
        return response()->json($questions);
    }

    //Méthode pour stocker les réponses en base de donnée

    public function storeReponses(Request $request)
    {
        // Validation des données de la requête
        $validator = Validator::make($request->all(), [
            'responses' => 'required|array',
            'responses.*.question_id' => 'required|exists:questions,id',
            'responses.*.answer' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Récupération des réponses et génération d'un token unique pour le sondé
        $responses = $request->input('responses');
        $surveyToken = uniqid('survey_');

        // Vérification spécifique pour la question 1 (question_id = 1)
        $question1Response = collect($responses)->firstWhere('question_id', 1);
        if (!$question1Response || !filter_var($question1Response['answer'], FILTER_VALIDATE_EMAIL)) {
            return response()->json(['error' => 'La réponse à la première question doit être une adresse email valide.'], 400);
        }

        // Récupération des questions associées aux réponses
        $questionIds = collect($responses)->pluck('question_id')->unique();
        $questions = Question::whereIn('id', $questionIds)->get();

        // Définir l'ordre souhaité des questions en fonction de votre seeder
        $questionOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        // Trier les réponses dans l'ordre des questions spécifié
        $sortedResponses = collect($questionOrder)->map(function ($questionId) use ($responses) {
            return collect($responses)->firstWhere('question_id', $questionId);
        })->filter();

        // Enregistrement des réponses dans la base de données
        foreach ($sortedResponses as $response) {
            $questionId = $response['question_id'];
            $answer = $response['answer'];

            // Vérification si la question existe
            $question = $questions->firstWhere('id', $questionId);
            if (!$question) {
                continue;
            }

            // Vérification si le sondé a déjà répondu à cette question de type A (choix multiple)
            if ($question->type === 'A') {
                $option = Option::where('question_id', $questionId)->where('text', $answer)->first();
                if (!$option) {
                    // Si la réponse n'est pas une option valide, ne pas l'enregistrer et passer à la question suivante
                    continue;
                }
            }

            // Création d'une nouvelle réponse
            $reponse = new Reponse();
            $reponse->survey_token = $surveyToken;
            $reponse->question_id = $questionId;
            $reponse->answer = $answer;
            $reponse->save();
        }

        return response()->json(['survey_token' => $surveyToken]);
    }




   // Méthode pour afficher les réponses d'un sondé spécifique
    public function showReponses($surveyToken)
    {
        // Récupération des réponses du sondé selon le token
        $responses = Reponse::where('survey_token', $surveyToken)->get();

        if ($responses->isEmpty()) {
            return response()->json(['message' => 'Aucune réponse trouvée pour ce sondé.']);
        }

        // Récupération des questions associées aux réponses
        $questionIds = $responses->pluck('question_id')->unique();
        $questions = Question::whereIn('id', $questionIds)->with('options')->get();

        $formattedResponses = [];

        // Formatage des réponses avec les questions correspondantes
        foreach ($responses as $response) {
            $question = $questions->firstWhere('id', $response->question_id);

            if ($question) {
                $formattedResponse = [
                    'question' => $question,
                    'answer' => $response->answer,
                ];

                // Pour les questions de type A, inclure les options de réponse
                if ($question->type === 'A') {
                    $formattedResponse['options'] = $question->options;
                }

                $formattedResponses[] = $formattedResponse;
            }
        }

        return response()->json($formattedResponses);
    }



    public function getAllReponses()
    {
        // Récupérer toutes les réponses avec les questions associées
        $reponses = Reponse::with('question')->get();
        $reponsesGroupedBySonde = [];

        foreach ($reponses as $reponse) {
            $sondeId = $reponse->survey_token; // Utiliser le champ "survey_token" comme identifiant unique du sondé
            if (!isset($reponsesGroupedBySonde[$sondeId])) {
                $reponsesGroupedBySonde[$sondeId] = [];
            }
            $reponsesGroupedBySonde[$sondeId][] = $reponse->toArray(); // Ajoutez les réponses sous forme de tableau
        }

        return response()->json($reponsesGroupedBySonde);
    }




    public function getQuestionResponses()
    {
        $questionIds = [6, 7, 10]; // ID des questions 6, 7 et 10

        $responses = Reponse::whereIn('question_id', $questionIds)
                            ->select('question_id', 'answer')
                            ->get();

        $formattedResponses = [];
        foreach ($responses as $response) {
            $formattedResponses[$response->question_id][] = $response->answer;
        }

        return response()->json($formattedResponses);
    }

    public function getQualityResponses()
{
    $questionIds = [11, 12, 13, 14, 15]; // ID des questions 11 à 15

    $responses = Reponse::whereIn('question_id', $questionIds)
                        ->select('question_id', 'answer')
                        ->get();

    $formattedResponses = [];
    foreach ($responses as $response) {
        $formattedResponses[] = [
            'question_id' => $response->question_id,
            'answer' => $response->answer,
        ];
    }

    return response()->json($formattedResponses);

}

}
