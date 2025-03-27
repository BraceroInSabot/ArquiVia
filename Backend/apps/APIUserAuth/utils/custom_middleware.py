from django.utils.deprecation import MiddlewareMixin

class PartitionedCookieMiddleware(MiddlewareMixin):

    def process_response(self, request, response):
        cookies_to_modify = ["access_token", "refresh_token"]

        # Se o cabeçalho Set-Cookie já existe, vamos modificar
        if response.cookies:
            for cookie_name in cookies_to_modify:
                if cookie_name in response.cookies:
                    cookie = response.cookies[cookie_name]
                    cookie_value = cookie.value

                    # Construindo o cabeçalho Set-Cookie com Partitioned
                    cookie_header = (
                        f"{cookie_name}={cookie_value}; "
                        f"Path=/; "
                        f"Secure; "
                        f"HttpOnly; "
                        f"SameSite=None; "
                        f"Partitioned"
                    )

                    # Adicionando o cabeçalho Set-Cookie modificado
                    if "Set-Cookie" in response.headers:
                        response.headers["Set-Cookie"] += f", {cookie_header}"
                    else:
                        response.headers["Set-Cookie"] = cookie_header

        return response
