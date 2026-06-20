import { useState } from "react";
import MarkdownViewer from "./MarkdownViewer";
import "../style/AcceleratorCard.css";

export const AcceleratorCard = ({ data: props }) => {
  const isChatOpen = false;
  console.log("accelerator card props: ", props);
  const deploymentResponse = props?.response ?? props;
  const deploymentDownloadUrl = deploymentResponse?.download_url;
  const deploymentResources = deploymentResponse?.resources_detected;

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const zipFileUrl =
    typeof props?.zip_file === "string"
      ? props.zip_file.replace(/%22$/, "").replace(/"$/, "").trim()
      : "";
  return (
    <>
      {props.answer &&
        !props.accelerators_list &&
        !props.accelerator_list &&
        !props.lab_exercise_list &&
        !props.readme_content &&
        !props.exercises &&
        !props.requirements &&
        !props.files_generated &&
        (
          <>
            <div
              className="containeracclerator"
              style={{
                width: isChatOpen ? "calc(73% - 35px)" : "",
              }}
            >
              <div className="k-chat-bubble">
                <div className="dynamicContentWrapper">
                  <p className="cardanswer">Cora: {props.answer}</p>
                </div>
              </div>
            </div>
          </>
        )}

      {props.lab_exercise_list && (
        <>
          <div className="containeracclerator">
            <div className="k-chat-bubble">
              <div className="dynamicContentWrapper">
                <div className="acceleratorsContainer">
                  {props?.lab_exercise_list?.map((item, index) => (
                    <>
                      {index === 0 ? (
                        <>
                          <div className="acceleratorCard" key={index}>
                            <div className="cardHeader">
                              <h6 className="cardTitle">{item.title}</h6>
                            </div>

                            {item.github_url && (
                              <embed
                                src={item.github_url.trim()}
                                title={item.title}
                                style={{
                                  width: "100%",
                                  height: "80vh",
                                  border: "none",
                                }}
                              />
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="acceleratorCard" key={index}>
                            <div className="cardHeader">
                              <h6 className="cardTitle">{item.title}</h6>
                            </div>

                            {item.github_url && (
                              <div className="cardLink">
                                <a
                                  href={item.github_url.trim()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="githubLink"
                                >
                                  🔗 View on GitHub
                                </a>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {(props.accelerators_list || props.accelerator_list) && (
        <>
          {props.match_found ? (
            <>
              <div className="containeracclerator">
                <div className="k-chat-bubble">
                  <div className="dynamicContentWrapper">
                    <div className="acceleratorsContainer">
                      {(
                        props?.accelerators_list || props?.accelerator_list
                      ).map((item, index) => (
                        <div className="acceleratorCard" key={index}>
                          <div className="cardHeader">
                            <h6 className="cardTitle">{item.title}</h6>

                            {item.status && (
                              <span
                                className={`statusBadge ${item.status
                                  .toLowerCase()
                                  .replace(" ", "_")}`}
                              >
                                {item.status}
                              </span>
                            )}
                          </div>

                          <p className="cardDescription">{item.description}</p>

                          {item.category && (
                            <div className="cardMeta">
                              <strong>Category:</strong> {item.category}
                            </div>
                          )}

                          {item.products_and_services?.length > 0 && (
                            <div className="cardProducts">
                              <strong>Products & Services:</strong>
                              <ul>
                                {item.products_and_services.map((prod, idx) => (
                                  <li key={idx}>{prod}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.github_url && (
                            <div className="cardLink">
                              <a
                                href={item.github_url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="githubLink"
                              >
                                🔗 View on GitHub
                              </a>
                            </div>
                          )}

                          {item.solution_overview && (
                            <div className="cardDescription">
                              <br />
                              {item.solution_overview}
                            </div>
                          )}

                          {item?.architecture_image_url && (
                            <div className="cardDescription">
                              <br />
                              <img
                                src={item?.architecture_image_url}
                                alt={item?.architecture_image_url}
                                width={800}
                                className="architecture_image"
                              />
                            </div>
                          )}

                          {item?.quick_deploy_url && (
                            <div className="cardLink">
                              <br />
                              <h6 className="cardTitle">Quick Deploy</h6>

                              <a
                                href={item?.quick_deploy_url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="githubLink"
                              >
                                🔗 View Markdown
                              </a>
                            </div>
                          )}

                          {item?.prerequisites?.length > 0 && (
                            <div className="cardProducts">
                              <br />
                              <br />
                              <h6 className="cardTitle">Prerequisites</h6>
                              <ul>
                                {item.prerequisites.map((prod, idx) => (
                                  <li key={idx}>{prod}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item?.cost_estimate && (
                            <div className="cardDescription">
                              <br />
                              <h6 className="cardTitle">Cost Estimate</h6>
                              {item?.cost_estimate}
                            </div>
                          )}

                          {item?.sample_pricing_url && (
                            <div className="cardLink">
                              <br />
                              <h6 className="cardTitle">Sample Pricing</h6>

                              <a
                                href={item?.sample_pricing_url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="githubLink"
                              >
                                🔗 View Sample Pricing
                              </a>
                            </div>
                          )}
                        </div>
                      ))}

                      {props?.requirements?.length > 0 && (
                        <div className="cardProductsRequirement">
                          <h3 className="cardTitleRequirement">Requirements</h3>
                          <ul>
                            {props?.requirements?.map((prod, idx) => (
                              <li key={idx}>{prod}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="containeracclerator">
                <div className="k-chat-bubble">
                  <div className="dynamicContentWrapper">
                    <div className="acceleratorsContainer">
                      {props?.requirements?.length > 0 && (
                        <div className="cardProductsRequirement">
                          <h3 className="cardTitleRequirement">Requirements</h3>
                          <ul>
                            {props?.requirements?.map((prod, idx) => (
                              <li key={idx}>{prod}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {props?.readme_content && (
        <div className="containeracclerator">
          <div className="k-chat-bubble">
            <div className="dynamicContentWrapper">
              <MarkdownViewer markdownString={props.readme_content} />
            </div>
          </div>
        </div>
      )}

      {props?.exercises && (
        <div className="containeracclerator">
          <div className="k-chat-bubble">
            <div className="tabHeader">
              {props.exercises.map((item, index) => (
                <button
                  key={`tab-${index}`}
                  className={activeTabIndex === index ? "activeTab" : "tab"}
                  onClick={() => setActiveTabIndex(index)}
                >
                  Exercise {index + 1}
                </button>
              ))}
            </div>

            <div className="dynamicContentWrapper">
              <MarkdownViewer
                markdownString={props.exercises[activeTabIndex]?.readme_content}
              />
            </div>
          </div>
        </div>
      )}

      {deploymentDownloadUrl && (
        <div className="containeracclerator">
          <div className="k-chat-bubble">
            <div className="dynamicContentWrapper">
              <div className="deploymentCard">
                {/* Header */}
                <div className="deploymentHeader">
                  <div>
                    <h3 className="deploymentTitle">Deployment Artifacts</h3>
                  </div>
                </div>
                {/* Resources */}
                {deploymentResources?.length > 0 && (
                  <div className="section">
                    <h4>Resources Detected</h4>

                    <div className="resourceTags">
                      {deploymentResources.map(
                        (resource, index) => (
                          <span key={index} className="resourceTag">
                            {resource}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {/* Download */}
                <div className="downloadSection">
                  <a
                    href={deploymentDownloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cssbuttonsiobutton"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path
                        fill="currentColor"
                        d="M1 14.5a6.496 6.496 0 0 1 3.064-5.519 8.001 8.001 0 0 1 15.872 0 6.5 6.5 0 0 1-2.936 12L7 21c-3.356-.274-6-3.078-6-6.5zm15.848 4.487a4.5 4.5 0 0 0 2.03-8.309l-.807-.503-.12-.942a6.001 6.001 0 0 0-11.903 0l-.12.942-.805.503a4.5 4.5 0 0 0 2.029 8.309l.173.013h9.35l.173-.013zM13 12h3l-4 5-4-5h3V8h2v4z"
                      ></path>
                    </svg>
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
