package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/onlysumitg/qsql2/internal/models"
)

func (app *application) CurrentServerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		currentServerID := app.sessionManager.GetString(r.Context(), "currentserver")
		_, err := app.servers.Get(currentServerID)

		if err != nil {
			app.sessionManager.Put(r.Context(), "flash", "Please select a severs")

			http.Redirect(w, r, fmt.Sprintf("/servers?next=%s", r.URL.RequestURI()), http.StatusSeeOther)
		}
		next.ServeHTTP(w, r)
	})

}

// ------------------------------------------------------
//
// ------------------------------------------------------
type RunQueryReqest struct {
	SQLToRun string
}

// ------------------------------------------------------
//
// ------------------------------------------------------
func (app *application) QueryHandlers(router *chi.Mux) {
	router.Route("/query", func(r chi.Router) {
		r.Use(app.CurrentServerMiddleware)
		//r.With(paginate).Get("/", listArticles)
		r.Get("/", app.QueryScreen)
		r.Post("/run", app.RunQueryPostAsync)
		r.Post("/loadmore", app.LoadMoreQueryPost)

	})

}

// ------------------------------------------------------
//
// ------------------------------------------------------
func (app *application) QueryScreen(w http.ResponseWriter, r *http.Request) {
	data := app.newTemplateData(r)

	app.render(w, r, http.StatusOK, "query.tmpl", data)

}

// ------------------------------------------------------
//
// ------------------------------------------------------

func (app *application) LoadMoreQueryPost(w http.ResponseWriter, r *http.Request) {
	currentServerID := app.sessionManager.GetString(r.Context(), "currentserver")
	currentServer, err := app.servers.Get(currentServerID)
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	runningSQL := &models.RunningSql{}
	err = json.NewDecoder(r.Body).Decode(&runningSQL)
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	models.PrepareSQLToRun(runningSQL)
	queryResult := models.ActuallyRunSQL2(*currentServer, *runningSQL)

	app.writeJSON(w, http.StatusOK, queryResult[0], nil)

}

// ------------------------------------------------------
//
// ------------------------------------------------------
func (app *application) RunQueryPostAsync(w http.ResponseWriter, r *http.Request) {

	log.Println("RunQueryPostAsync>>>>> >>>>>>")

	currentServerID := app.sessionManager.GetString(r.Context(), "currentserver")
	currentServer, err := app.servers.Get(currentServerID)
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	request := &RunQueryReqest{}

	// Initialize a new json.Decoder instance which reads from the request body, and
	// then use the Decode() method to decode the body contents into the input struct.
	// Importantly, notice that when we call Decode() we pass a *pointer* to the input
	// struct as the target decode destination. If there was an error during decoding,
	// we also use our generic errorResponse() helper to send the client a 400 Bad
	// Request response containing the error message.
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	queryResults := models.ProcessSQLStatements(request.SQLToRun, currentServer)

	for _, queryResult := range queryResults {
		if queryResult.CurrentSql.StatementType == "@BATCH" {
			batchSql := &models.BatchSql{Server: *currentServer,
				RunningSql: queryResult.CurrentSql}

			app.batchSQLModel.Insert(batchSql)
		}
	}
	// w.Header().Set("Content-Type", "application/json")
	// w.Write(queryResultsJson)
	app.writeJSON(w, http.StatusOK, queryResults, nil)
}