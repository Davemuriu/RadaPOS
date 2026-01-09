from app import create_app

app = create_app()   # Flask must see this variable name exactly

if __name__ == "__main__":
    app.run(port=5555, debug=True)
