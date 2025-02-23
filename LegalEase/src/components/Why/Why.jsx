import './Why.css'
import sheild from '../../assets/sheild.gif'
import clock from '../../assets/clock.gif'
import chat from '../../assets/chat.gif'

export default function Why() {
    return (
        <div className='why-section col-12 px-lg-2 px-3' id="why">
            <h1 className="why-head text-center">Why Choose LegalEase?</h1><br /><br /><br />
            <div className="d-flex justify-content-center">
                <div className="row w-100">
                    <div className="col-12 col-md-4 mb-4 text-center">
                        <div className="p-4 shadow rounded why-card">
                            <img src={sheild} alt="" width='50' />
                            <h2>Secure & Compliant</h2>
                            <p className="text-justify">Enterprise-grade security with end-to-end encryption for all your legal documents and communications.</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-4 text-center">
                        <div className="p-4 shadow rounded why-card">
                            <img src={clock} alt="" width='50' />
                            <h2>Save Time</h2>
                            <p className="text-justify">Automate routine tasks and manage your practice more efficiently with our integrated tools.</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-4 text-center">
                        <div className="p-4 shadow rounded why-card">
                            <img src={chat} alt="" width='50' />
                            <h2>Better Delivery</h2>
                            <p className="text-justify">Stay connected with clients through secure messaging and real-time updates on case progress.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
