function Home() {
    return (
        <>
            <nav class="navbar  navbar-fixed-top navbar-inverse">
                <div class="container">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbar-collapse">
                        <ul class="nav navbar-nav ">
                            <li><a href="./index.html" title="">01 : Home</a></li>
                            <li><a href="./works.html" title="">02 : Works</a></li>
                            <li><a href="./about.html" title="">03 : About me</a></li>
                            <li><a href="./contact.html" title="">04 : Contact</a></li>
                            <li><a href="./components.html" title="">05 : Components</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Home;
