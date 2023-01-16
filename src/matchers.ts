import {Matcher} from "./registry";

const AlwaysExecuteMatcher : Matcher = {
  id: "always-execute",
  match(){
    return true
  }
}

export const PreRegisteredMatchers = [
  AlwaysExecuteMatcher
]
