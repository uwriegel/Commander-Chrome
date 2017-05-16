namespace Commander
open System
open System.Collections.Generic;
open System.Threading
    
module SessionState = 

    let mutable created = false

    type State = {
        FirstSession: bool;
        ScopeIds: Dictionary<string, int>;
    }

    let create () = 
        match created with
        | false -> 
            created = true |> ignore
            {  FirstSession = true; ScopeIds = new Dictionary<string, int>(); }
        | true ->
            {  FirstSession = false; ScopeIds = new Dictionary<string, int>(); }

    let SetScopeId (state: State) scopeId =
        lock state (fun () ->
            let (found, scope) = state.ScopeIds.TryGetValue scopeId
            match found with
            | false -> state.ScopeIds.Add(scopeId, 1)
            | true ->  state.ScopeIds.[scopeId] <- scope + 1
            scope + 1)

    let CheckScopeId (state: State) (scope: string) (id: int) =
        lock state (fun () ->
            match scope, id with
            | null, _  -> false
            | _, -1 -> false
            | _ -> state.ScopeIds.[scope] = id)


