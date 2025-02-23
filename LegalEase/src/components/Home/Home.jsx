import './Home.css'

export default function Home() {
    return (
        <div className='home-section col-12 px-lg-2 px-3' id="home">
            <h1 className="home-head text-center">Streamline Your Legal Practise</h1>
            <p className="home-para text-center">LegalEase helps lawyers and clients manage case, schedule appointments, and collaborate efficently in one secure platform.</p>
            <div className="d-flex justify-content-center">
                <button className="btn btn-primary mx-4">Get Started</button>
                <button className="btn btn-primary mx-4 contact-btn">Contact Us</button>
            </div>
        </div>
    )
}
