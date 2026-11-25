
package com.gymapp.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.MediaType;

@Controller
public class SpaController {

    @GetMapping(value = {
            "/",
            "/{path:^(?!api$|assets$|icons$)[^\\.]+}",
            "/{path:^(?!api$|assets$|icons$)[^\\.]+}/**"
    }, produces = MediaType.TEXT_HTML_VALUE)
    public String forward() {
        return "forward:/index.html";
    }
}
